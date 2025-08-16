const mongoose = require("mongoose");

const emissionSchema = new mongoose.Schema({
  industryId:{
type:mongoose.Schema.Types.ObjectId,
ref:"Industry",
required:true
  },
 emissions:{
co2:Number,
so2:Number,
nox:Number,
other:Number
 },
  energyConsumption: {
    type: Number,
    default: 0,
  },
  
  date: {
    type: Date,
    default: Date.now,
  },
  reportImages: [
    {
      type: String, 
    },]
});

module.exports = mongoose.model("EmissionRecord", emissionSchema);