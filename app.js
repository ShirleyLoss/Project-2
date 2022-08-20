const express = require('express');
const path = require('path');
const router = require('./routes/index');
const bodyParser = require('body-parser');
const passport = require('passport');
const mongoose = require('mongoose');
const mongoSanitize = require("express-mongo-sanitize");
const app = express();
const expressSession = require('express-session');
const Registration = mongoose.model('Registration');
const passportLocal = require("passport-local"); //
const rateLimit = require("express-rate-limit");
const xss = require("xss-clean");
const helmet = require("helmet");
const limit = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests",
});

const bcrypt = require("bcrypt");

app.use(helmet());
app.use(xss());
app.use(mongoSanitize());
app.use("/routeName", limit);
app.use(express.json({ limit: "10kb" }));
app.use(require("morgan")("combined"));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/", router);
// app.use(passport.initialize()); //Removed to show the website
// app.use(passport.session()); //Removed to show the website. The sequence matter
app.use(express.static("public"));
app.use(
    expressSession({
      secret: "secret",
      resave: false,
      saveUninitialized: true,
      cookie: {
        httpOnly: true,
        secure: true,
        maxAge: 1 * 60 * 1000,
      },
    })
  );
// app.use("/", router); //Move it to above
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(Registration.serializeUser()); //repeated
passport.deserializeUser(Registration.deserializeUser()); //repeated
  
// passport.use(
//   new passportLocal(function (isuserName, password, done) {
//     Registration.findOne({ username: username }, function (err, user) {
//       if (err) {
//         return done(err);
//       }
//       if (!user) {
//         return done(null, false);
//       }
//       if (!user.verifyPassword(password)) {
//         return done(null, false);
//       }
//       return done(null, user);
//     });
//   })
// );

passport.use(
  new passportLocal({ usernameField: "username" }, (username, password, done) => {
    Registration.findOne({ username: username })
      .then((user) => {
        if (!user) {
          const newUser = new User({ username, password });

          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;
              newUser.password = hash;
              newUser
                .save()
                .then()((user) => {
                  return done(null, user);
                })
                .catch((err) => {
                  return done(null, false, { message: err });
                });
            });
          });
        } else {
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;

            if (isMatch) {
              return done(null, user);
            } else {
              return done(null, false, { message: "Wrong Password" });
            }
          });
        }
      })
      .catch((err) => {
        return done(null, false, { message: err });
      });
  })
);
  
// passport.serializeUser(Registration.serializeUser());
// passport.deserializeUser(Registration.deserializeUser());

module.exports = app;