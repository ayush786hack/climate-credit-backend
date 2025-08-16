const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

require("dotenv").config();

// Nodemailer setup
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // use TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
 
});


// Signup
exports.register = async (req, res) => {
  console.log("Register request body:", req.body);

  try {
    const { username, email, password } = req.body;

    // Check existing user
    let existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);


  
   
    // Create verification token
    const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
//set role
let role="user";
if(email===process.env.ADMIN_EMAIL){
  role="admin"
}

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      verificationToken,
      role
    });
   

   await newUser.save();
  // console.log("Saved hash:", newUser.password);
    // Send verification email
    const verifyLink = `${process.env.BASE_URL}/api/auth/verify-email?token=${verificationToken}`;
    await transporter.sendMail({
      from: `"Climate Credit" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify Your Email",
      html: `<p>Click <a href="${verifyLink}">here</a> to verify your email.</p>`,
    });

    res
      .status(201)
      .json({
        message: "User registered. Please check your email for verification.",
      });
  } catch (err) {
    const { email } = req.body;
    await User.deleteOne({ email });

    res.status(500).json({ message: err.message });
  }
};

// Verify Email

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
   
   
    if (!token) {
      return res.status(400).json({ message: "Invalid token" });
    }

    // Decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by email and token
    const user = await User.findOne({ 
      email: decoded.email, 
      verificationToken: token 
    });

    if (!user) {
      return res.status(400).json({ message: "User not found or token invalid" });
    }

    // Update verification status
    user.isVerified = true;
    user.verificationToken = undefined;
   await user.save();
  // console.log("Saved hash:", user.password);
    return res.json({ message: "Email verified successfully" });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Fetch user from DB
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check if verified
    if (!user.isVerified) {
      return res
        .status(400)
        .json({ message: "Please verify your email first" });
    }

    // Compare plain password with hashed password from DB

    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ message: "Login successful", token });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//forgot and reset password logic
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const token = crypto.randomBytes(32).toString("hex");
  user.resetToken = token;
  user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
  await user.save();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  const resetLink = `${process.env.BASE_URL}/reset-password.html?token=${token}`;

  await transporter.sendMail({
    to: user.email,
    subject: "Password Reset",
    text: `Click here to reset: ${resetLink}`,
  });

  res.json({ message: "Password reset link sent to your email" });
};

exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  const user = await User.findOne({
    resetToken: token,
    resetTokenExpiry: { $gt: Date.now() },
  });

  if (!user)
    return res.status(400).json({ message: "Invalid or expired token" });

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  await user.save();

  res.json({ message: "Password has been reset successfully" });
};

//logout logic

exports.logout = (req, res) => {
 
  return res.json({ message: "Logged out successfully" });
};
