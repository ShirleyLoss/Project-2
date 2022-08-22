// const passport = require("passport");
// const passportLocal = require("passport-local").Strategy; //
// const bcrypt = require("bcrypt");
// const Registration = require("../models/Registration")

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

// module.exports = passport;