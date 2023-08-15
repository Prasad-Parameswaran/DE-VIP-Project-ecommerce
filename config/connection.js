const mongoose = require("mongoose");
const mongourl= process.env.Mongourl
console.log(mongourl);
mongoose
  .connect(mongourl)
  .then(() => {
    console.log("db connected");
  })
  .catch((err) => {
    console.log(err,"ggggggg");
  });



  // prasad king

