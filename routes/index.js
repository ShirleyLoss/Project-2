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
  res.render('index', { title: 'home page', path: req.url });
});

// router.get('/home', (req, res) => {
  //res.send('It works!');
  // res.render('index', { title: 'home page', path: req.url });
// });
// Same as get('/')

router.get('/register', (req, res) => {
  //res.send('It works!');
  res.render('index', { title: 'register page', path: req.url });
});

router.get('/thankyou', (req, res) => {
  //res.send('It works!');
  res.render('index', { title: 'thankyou page', path: req.url, content: "Thank you for your registration!" });
});

router.get('/login', (req, res) => {
  //res.send('It works!');
  res.render('index', { title: 'login page', path: req.url });
});

router.get('/contact', 
  connectEnsureLogin.ensureLoggedIn(),
  function (req, res) {
    res.render('index');
  })

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
    (req, res) => {
      //console.log(req.body);
      const errors = validationResult(req);
      if (errors.isEmpty()) {
        Registration.register(
          new Registration({
            name: req.body.name,
            email: req.body.email,
            username: req.body.username,
            password: req.body.password,
          }),
          req.body.password,
          function (err, user) {
            if (err) {
              console.log(err);
              res.render("register");
            }
            passport.authenticate("local")(req, res, function(){
              res.redirect("/login");
            });
          }
        );
      } else {
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
    failureRedirect: "/login",
  }),
  function (req, res) {
    res.redirect("/");
  }
);

module.exports = router;