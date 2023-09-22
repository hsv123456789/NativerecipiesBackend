const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");
const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  resetPasswordOTP: {
    type: String,
    required: false,
  },
});

userSchema.statics.signup = async function (username, email, password) {
  const exists = await this.findOne({ email });
  const usernameExists = await this.findOne({ username });
  if (!email || !password || !username) {
    throw Error("All fields must be filled");
  }
  if (!validator.isEmail(email)) {
    throw Error("This is not a valid email");
  }

  if (usernameExists && exists) {
    throw Error("the username and email already in use");
  }
  if (exists) {
    throw Error("The email already in use");
  }
  if (usernameExists) {
    throw Error("The username already in use");
  }
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  const user = await this.create({
    username: username,
    email: email,
    password: hash,
  });
  return user;
};

userSchema.statics.login = async function (username, password) {
  if (!username || !password) {
    throw Error("All fields must be filled properly ");
  }
  const user = await this.findOne({ username });
  if (!user) {
    throw Error("Enter a valid username");
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw Error("Not a valid password");
  }
  return user;
};
const userModel = mongoose.model("user", userSchema);

module.exports = userModel;
