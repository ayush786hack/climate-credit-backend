const mongoose=require("mongoose");
const bcrypt=require("bcryptjs");
const Industry = require("../models/Industry");

 const userSchema = new mongoose.Schema({
   username: {
     type: String,
     required: true,
     unique: true,
   },
   email: {
     type: String,
     required: true,
     unique: true,
     lowercase: true,
     trim: true,
     match: [
       /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
       "Please enter a valid email address",
     ],
   },
   password: {
     type: String,
     required: true,
   },
   isVerified: {
     type: Boolean,
     default: false,
   },
   verificationToken: { type: String },
   role: {
     type: String,
     enum: ["admin", "user","owner"],
     default: "user",
   },
   resetToken: String,
   resetTokenExpiry: Date,
   
  industry: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Industry", 
    default: null,   
 }});

 module.exports=mongoose.model("User",userSchema);


 
  