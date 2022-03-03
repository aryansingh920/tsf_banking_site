const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    amount:{
        type:Number,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    transactions:{
        type:Array
    }
});

const usermodel = mongoose.model("User", userSchema);
module.exports = usermodel;


// transactionAmount:{
//     type:Number,
// },
// date:{
//     type:Date,
// },
// message:{
//     type:String,
// },
// sender:{
//     type:String,
// },
// recipient:{
//     type:String,
// },
// totalAmount:{
//     type:Number,
// }