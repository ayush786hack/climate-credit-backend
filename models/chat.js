const mongoose = require("mongoose");

const chatSchema =new mongoose.Schema({
    from:{
        type:String,
        required:true
    },
    to:{
        type:String,
        maxLength :20
    },
    message :{
        type:String,
    },
    created_at:{
        type:Date,
    }

})
const Chat = mongoose.model("Chat",chatSchema);
module.exports =Chat;