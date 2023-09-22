require("dotenv").config();
const User = require("../models/usermodel");
const jwt = require("jsonwebtoken");
const transporter = require("./transporter");
function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: "3d" });
};

const loginUser = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.login(username, password);
    const token = createToken(user._id);
    res.status(200).json({ username, token });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

const signupUser = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const user = await User.signup(username, email, password);
    const token = createToken(user._id);
    res.status(200).json({ username, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).send("The given email does not exist");
    }
    const otp = generateOTP();
    user.resetPasswordOTP = otp;

    await user.save();
    const mailOptions = {
      from: `${process.env.EMAIL}`,
      to: email,
      sub: `password reset otp`,
      text: `The otp for rest password is ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        res.status(500).json({ error: `error sending email due to ${error}` });
      }
      res
        .status(200)
        .json({ message: `email has been sent to your email ${email}` });
    });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

const resetPassword = async (req, res) => {
  const { otp, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ error: "Not a valid email address" });
    }
    if (user.resetPasswordOTP !== otp) {
      res.status(404).json({ error: "Not a valid otp " });
    }
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    user.password = hash;
    user.resetPasswordOTP = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

module.exports = {
  signupUser,
  loginUser,
  forgotPassword,
  resetPassword,
};
