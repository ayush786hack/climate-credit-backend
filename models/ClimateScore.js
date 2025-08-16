const mongoose=require("mongoose");

const climateScoreSchema = new mongoose.Schema({
    industry:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Industry",
        required:true
    },
    score:{
        type:Number,
        required:true},
  rating:{
    type:String,
    enum:["Excellent", "Good", "Average", "Poor", "Critical"],
default:"Average"
  },
  CalculatedAt:{
    type:Date,
    default:Date.now
  }

})

module.exports = mongoose.model("ClimateScore", climateScoreSchema);