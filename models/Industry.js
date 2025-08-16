const mongoose = require("mongoose");

const industrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  sector: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    country: String,
    state: String,
    city: String,
  },
  climateScore: {
    type: Number,
    default: 100,
  
  },owner:{
type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required:true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Industry", industrySchema);
