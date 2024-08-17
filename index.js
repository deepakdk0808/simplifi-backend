const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

const users=require('./controllers/user');


dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

app.use('/users',users);


mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    // console.log("DB Success");
  })
  .catch((err) => {
    console.log(err);
  });

const port = process.env.PORT_NO || 4040    ;
 app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

