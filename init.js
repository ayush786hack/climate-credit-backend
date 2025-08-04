const mongoose = require("mongoose");
const Chat = require("./models/chat.js");
main()
.then(()=>{
    console.log("connection success");
})
.catch((err)=>{
    console.log(err);
})
async function main(){
  await mongoose.connect("mongodb://127.0.0.1:27017/whatsapp")
};

let allChats = [
  { from: "mihir", to: "mihi", message: "hello!", created_at: new Date() },
  { from: "sumi", to: "mehak", message: "hmmmmm", created_at: new Date() },
  { from: "mohit", to: "manav", message: "hey there!", created_at: new Date() },
  { from: "kiri", to: "siri", message: "you're  awesome!", created_at: new Date() },
  { from: "gay", to: "gay", message: "you're gay", created_at: new Date() },
  { from: "prateek", to: "mihi", message: "mochi mochi!", created_at: new Date() },
];
Chat.insertMany(allChats);

