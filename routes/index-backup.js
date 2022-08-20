// From Start.js
require('./models/Registration');
const app = require('./app');
const server = app.listen(3000, () => {
  console.log(`Express is running on port ${server.address().port}`);
});
// Start.js end

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const auth = require('http-auth');
const bcrypt = require("bcrypt");
const { check, validationResult } = require('express-validator');

const router = express.Router();
const Registration = mongoose.model('Registration');
const basic = auth.basic({
  file: path.join(__dirname, '../users.htpasswd'),
});

router.get('/', (req, res) => {
  //res.send('It works!');
  res.render('index', { title: 'home page', path: req.url });
});

router.get('/register', (req, res) => {
  //res.send('It works!');
  res.render('index', { title: 'register page', path: req.url });
});

router.get('/registrants', basic.check((req, res) => {
  Registration.find()
    .then((registrations) => {
      res.render('registrants', { title: 'Listing registrations', registrations });
    })
    .catch(() => { 
      res.send('Sorry! Something went wrong.'); 
    });
}));

router.get('/thankyou', (req, res) => {
  //res.send('It works!');
  res.render('index', { title: 'thankyou page', path: req.url, content: "Thank you for your registration!" });
});

router.get('/login', (req, res) => {
  //res.send('It works!');
  res.render('index', { title: 'login page', path: req.url });
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
        //console.log(req.body);
        const errors = validationResult(req);
        if (errors.isEmpty()) {
          const registration = new Registration(req.body);
          //generate salt to hash password
          const salt = await bcrypt.genSalt(10);
          //set user password to hashed password
          registration.password = await bcrypt.hash(registration.password, salt);

          registration.save()
            .then(() => {res.redirect('/thankyou');})
            .catch((err) => {
              console.log(err);
              res.send('Sorry! Something went wrong.');
            });
          } else {
            res.render('index', { 
                title: 'register page',
                path: req.url,
                errors: errors.array(),
                data: req.body,
             });
          }
    });

/* Routes */
const connectEnsureLogin = require('connect-ensure-login');

router.post('/login', (req, res, next) => {
    passport.authenticate('local',
        (err, user, info) => {
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.redirect('/login?info=' + info);
            }

            req.logIn(user, function (err) {
                if (err) {
                    return next(err);
                }

                return res.redirect('/');
            });
        })(req, res, next);
});

// app.get("/login",
//     (req, res) => res.sendFile("html/login.html", 
//     { root: __dirname })
// );

// app.get("/",
//     connectEnsureLogin.ensureLoggedIn(),
//     (req, res) => res.sendFile("html/index.html", { root: __dirname })
// );

// app.get("/private",
//     connectEnsureLogin.ensureLoggedIn(),
//     (req, res) => res.sendFile("html/private.html", { root: __dirname })
// );

// app.get("/user",
//     connectEnsureLogin.ensureLoggedIn(),
//     (req, res) => res.send({ user: req.user })
// );

// app.get("/logout",
//     (req, res) => {
//         req.logout(function (err) {
//                 if (err) { return next(err);}
//             }),
//             res.sendFile("html/logout.html", 
//             { root: __dirname });
//     });
// From authApp end

module.exports = router;


// app.js
const express = require('express');
const path = require('path');
const routes = require('./routes/index');
const bodyParser = require('body-parser');

const app = express();

app.use(express.static('public'));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// from authApp
const expressSession = require('express-session')({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
});

app.use(bodyParser.json());
//  from authApp end

app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', routes);

// from authApp
app.use(expressSession);

// const port = process.env.PORT || 3000;
// app.listen(port, () => console.log('App listening on port ' + port));

const passport = require('passport');

app.use(passport.initialize());
app.use(passport.session());


// Mongoose Setup
require('dotenv').config();
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

mongoose.connect(process.env.DATABASE, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const Schema = mongoose.Schema;
const UserDetail = new Schema({
    username: String,
    password: String
});

UserDetail.plugin(passportLocalMongoose);
const UserDetails = mongoose.model('registrations', UserDetail, 'registrations');
// Change userInfo to registrations

mongoose.connection
  .on('open', () => {
    console.log('Mongoose connection open');
  })
  .on('error', (err) => {
    console.log(`Connection error: ${err.message}`);
  });

// const mongoose = require('mongoose'); in start.js
// const passportLocalMongoose = require('passport-local-mongoose'); in start.js

// mongoose.connect('mongodb://localhost/MyDatabase', 
//     { useNewUrlParser: true, useUnifiedTopology: true }); in start.js

// const Schema = mongoose.Schema;
// const UserDetail = new Schema({
//     username: String,
//     password: String
// }); in start.js

// UserDetail.plugin(passportLocalMongoose);
// const UserDetails = mongoose.model('userInfo', UserDetail, 'userInfo'); in start.js

/* passport local authentication */
passport.use(UserDetails.createStrategy());

passport.serializeUser(UserDetails.serializeUser());
passport.deserializeUser(UserDetails.deserializeUser());

//  from authApp end

module.exports = app;