require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const userRouter = require("./routes/user");
mongoose
  .connect(process.env.MONGO_URI)
  .then((res) => {
    console.log("connection is successful");
  })
  .catch((error) => {
    console.log(error);
  });

app.use(express.json());
app.use(cors());
app.use("/api/users", userRouter);
app.use((req, res, next) => {
  console.log(req.path, req.method);

  next();
});

app.listen(process.env.PORT, () => {
  console.log(`listening on port `, process.env.PORT);
});
