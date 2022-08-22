const connectEnsureLogin = require('connect-ensure-login');
const express = require("express");
const mongoose = require('mongoose');
const router = express.Router();
const passport = require('passport');

const bcrypt = require("bcrypt"); //Also in app.js
const Registration = require('../models/Registration');

const { check, validationResult } = require('express-validator');

router.get('/', (req, res) => {
  //res.send('It works!');
  res.render('index', { title: 'login page', path: req.url });
});

router.get('/login', (req, res) => {
  //res.send('It works!');
  res.render('index', { title: 'login page', path: req.url });
});

router.get('/register', (req, res) => {
  //res.send('It works!');
  res.render('index', { title: 'register page', path: req.url });
});

router.get('/thankyou', (req, res) => {
  //res.send('It works!');
  res.render('index', { title: 'thankyou page', path: req.url, content: "Thank you for your registration!" });
});

router.get('/contact', (req, res) => {
  //res.send('It works!');
  res.render('index', { title: 'contact page', path: req.url });
});

router.get('/logout', (req, res) => {
  //res.send('It works!');
  res.render('index', { title: 'logout page', path: req.url });
});

router.get('/blog', (req, res) => {
  //res.send('It works!');
  res.render('index', { title: 'index page', path: req.url });
});

// router.get('/contact', 
//   connectEnsureLogin.ensureLoggedIn(),
//   function (req, res) {
//     res.render('index');
//   })

// router.get('/registrants', basic.check((req, res) => {
//   Registration.find()
//     .then((registrations) => {
//       res.render('registrants', { title: 'Listing registrations', registrations });
//     })
//     .catch(() => { 
//       res.send('Sorry! Something went wrong.'); 
//     });
// }));

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
      console.log("testing from kk");
      console.log(req.body);
      const errors = validationResult(req);
      if (errors.isEmpty()) {
        console.log("we are in the success stage -- kk");
        //应该先 call passport。authenticate
        // 然后在passport.use里面call registration register
        passport.authenticate("local")(req, res, function(){
          console.log("auth callback function -- kk");
          // res.redirect("/login");
        });
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(req.body.password, salt);
        Registration.register(
          new Registration({
            name: req.body.name,
            email: req.body.email,
            username: req.body.username,
            password: hashPassword,
          }),
          req.body.password,
          function (err, user) {
            if (err) {
              console.log("callback function return error -- kk");
              console.log(err);
              res.render('index', { title: 'register page', path: req.url });
            } else {
              console.log("callback function redirect - miao");
              res.redirect("/login");
            }
            console.log("callback  function  return success");
            // 怎么跳转去 login page?
            // (req, res) => {
            //   res.redirect("/login");
            // }
            // passport.authenticate("local")(req, res, function(){
            //   console.log("auth callback function -- kk");
            //   res.redirect("/login");
            // });
          }
        );
      } else { //注册报错的处理方式
        res.render('index', { 
            title: 'register page',
            path: req.url,
            errors: errors.array(),
            data: req.body,
        });
      }
    });

router.post('/login', 
  passport.authenticate('local', {
    successRedirect: "/contact",
    failureRedirect: "/logout",
  }),
  function (req, res) {
    res.redirect("/");
  }
);

// checkAuthenticated = (req, res, next) => {
//   if (req.isAuthenticated()) { return next() }
//   res.redirect("/login")
// }

// router.get("/contact", checkAuthenticated, (req, res) => {
//   res.render("index", {username: req.body.username})
// })

module.exports = router;