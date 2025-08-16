// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Register new user
router.post("/register", authController.register,(req,res)=>{
    res.send("hello");
});

// Login user
router.post("/login", authController.login);

// Email verification (if implemented)
router.get("/verify-email", authController.verifyEmail);


//forgot password and reset route

router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);



//logout user
router.post("/logout", authController.logout);

module.exports = router;
