const express = require("express");
const mongoose = require('mongoose');
const passport = require('passport');
const localStrategy = require("passport-local");
const path = require("path");
const auth = require("http-auth"); //New Added 8.21.2022
const bcrypt = require("bcrypt");
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');
const User = require("../models/user"); //New Added 8.21.2022 new created
const router = express.Router();

const expressSession = require('express-session')({
  secret: "secret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 1 * 60 * 1000,
  },
});

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(
  new localStrategy(function (username, password, done) {
      User.findOne({ username: username }, function (err, user) {
          if (err) {
              return done(err);
          }
          if (!user) {
              return done(null, false, { message: "Incorrect username." });
          }
          return done(null, user);
      });
  })
);

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json()); //New Added 8.21.2022

router.use(expressSession);

router.use(passport.initialize());
router.use(passport.session());

const Registration = mongoose.model('Registration');
const basic = auth.basic({ //New Added 8.21.2022
  file: path.join(__dirname, '../users.htpasswd'), //New Added 8.21.2022
}); //New Added 8.21.2022

router.get("/logout",(req,res)=>{ //New Added 8.21.2022
  req.logout(function (err) { //New Added 8.21.2022
      if (err) { //New Added 8.21.2022
          return next(err); //New Added 8.21.2022
      } //New Added 8.21.2022
  }), //New Added 8.21.2022
  res.render("blog", { title: 'logout page', path: req.url }); //New Added 8.21.2022
}); //New Added 8.21.2022

router.get('/', (req, res) => {
  //res.send('It works!');
  res.render('index', { title: 'login page', path: req.url });  // Different
});

router.get('/register', (req, res) => {
  //res.send('It works!');
  res.render('index', { title: 'register page', path: req.url });
});

router.get('/login', (req, res) => {
  //res.send('It works!');
  res.render('index', { title: 'login page', path: req.url });
});

router.get('/thankyou', (req, res) => {
  //res.send('It works!');
  res.render('index', { title: 'thankyou page', path: req.url });
});

router.get('/blog', (req, res) => {
  //res.send('It works!');
  res.render('blog', { title: 'blog page', path: req.url });
});

router.get('/contact', (req, res) => {
  //res.send('It works!');
  res.render('blog', { title: 'contact page', path: req.url });
});

router.post('/login', function(req, res){
  User.findOne({ username: req.body.username }, function(err, user) {
    if (err) {
      res.render("loginerror", { user: user, error: err });
    }
    if (!user) {
        res.render("loginerror", { user: user, error: err });
    }
    res.render('blog', { user });
  });
});

router.post('/register', 
  [
    check('name')
    .isLength({ min: 1 })
    .withMessage('Please enter a name'),
    check('email')
    .isLength({ min: 1 })
    .withMessage('Please enter an email'),
    check('username')
    .isLength({ min: 1 })
    .withMessage('Please enter a username'),
    check('password')
    .isLength({ min: 1 })
    .withMessage('Please enter a password')
  ],
  async(req, res) => {
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);
    User.register(
      new User({
        name: req.body.name,
        email: req.body.email,
        username: req.body.username,
        password: hashPassword,
      }),
      req.body.password,
      function (err, user) {
        if (err) {
          console.log(err);
          res.render("error", { user: user, error: err });
        } else {
          passport.authenticate("local")(req, res, function () {
            res.redirect("/thankyou");
          });
        }
      }
    );
  }
);

module.exports = router;