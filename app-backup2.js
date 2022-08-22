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
const localStrategy = require("passport-local"); //
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
    // console.log("line 56 in app.js");
    // Registration.findOne({ username: username }, function (err, user) {
    //   console.log("line 58 in app.js");
    //   if (err) {
    //     console.log("line 60 in app.js");
    //     return done(err);
    //   }
    //   if (!user) {
    //     console.log("line 64 in app.js");
    //     return done(null, false);
    //   }
    //   if (!user.verifyPassword(password)) {
    //     console.log("line 68 in app.js");
    //     return done(null, false);
    //   }
    //   console.log("line 71 in app.js");
    //   return done(null, user);
//     });
//   })
// );

passport.use(
  new localStrategy(function (username, password, done) {
    console.log("in passportLocal kk");
    console.log(username);
    Registration.findOne({ username: username }).then((user) => {
      if (user) {
        console.log("test log1");
        //根据是register还是login来执行。需要确认当前页面
        //give a warning;
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) {
            throw err;
          };
          if (isMatch) {
            console.log("success");
            console.log(user);
            return done(null, user);
          } else {
            console.log("Wrong Password");
            return done(null, false, { message: "Wrong Password" });
          }
        });
      } else {
        console.log("test log 2");
        // Registration.register(
        //   new Registration({
        //     name: req.body.name,
        //     email: req.body.email,
        //     username: req.body.username,
        //     password: req.body.password,
        //   }),
        //   req.body.password,
        //   function (err, user) {
        //     if (err) {
        //       console.log("callback function return error -- kk");
        //       console.log(err);
        //       res.render('index', { title: 'register page', path: req.url });
        //     }
        //     console.log("callback  function  return success");
        //     // passport.authenticate("local")(req, res, function(){
        //     //   console.log("auth callback function -- kk");
        //     //   res.redirect("/login");
        //     // });
        //   }
        // );
      }
    })
  })
);

// passport.use(
//   new passportLocal({ usernameField: "username" }, (username, password, done) => {
//     Registration.findOne({ username: username })
//       .then((user) => {
//         if (!user) {
//           const newUser = new User({ username, password });

//           bcrypt.genSalt(10, (err, salt) => {
//             bcrypt.hash(newUser.password, salt, (err, hash) => {
//               if (err) throw err;
//               newUser.password = hash;
//               newUser
//                 .save()
//                 .then()((user) => {
//                   return done(null, user);
//                 })
//                 .catch((err) => {
//                   return done(null, false, { message: err });
//                 });
//             });
//           });
//         } else {
//           bcrypt.compare(password, user.password, (err, isMatch) => {
//             if (err) throw err;

//             if (isMatch) {
//               return done(null, user);
//             } else {
//               return done(null, false, { message: "Wrong Password" });
//             }
//           });
//         }
//       })
//       .catch((err) => {
//         return done(null, false, { message: err });
//       });
//   })
// );
  
// passport.serializeUser(Registration.serializeUser());
// passport.deserializeUser(Registration.deserializeUser());

module.exports = app;