const mongoose = require("mongoose");
const mongourl=process.env.Mongourl

mongoose
  .connect(mongourl)
  .then(() => {
    console.log("db connected");
  })
  .catch((err) => {
    console.log(err);
  });



  // prasad king

