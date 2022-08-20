require("dotenv").config();
const mongoose = require("mongoose");
require("./models/Registration");
const app = require("./app");
require("./app");

mongoose.connect(process.env.DATABASE, {
  useNewUrlParser: true,
  useUnifiedTopology: true
  })
  .then(console.log(`MongoDB connected ${process.env.DATABASE}`))
  .catch((err) => console.log(err));

mongoose.connection
  .on('open', () => {
    console.log('Mongoose connection open');
  })
  .on('error', (err) => {
    console.log(`Connection error: ${err.message}`);
  });

const server = app.listen(3000, () => {
  console.log(`Express is running on port ${server.address().port}`);
});