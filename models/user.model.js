import mongoose from "mongoose";
const userSchema =new mongoose.Schema({
    fullName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    mobileNumber:{
        type:String,
        required:true
    },
    //role like owner,deliveryboy,customer 
    role:{
        type:String,
        enum:["user","owner","deliveryboy"],//enum means a list of predefined ,fixed values that a field is allowed to have.
        required:true

    },
    resetOtp:{
        type:String,

    },
    isOtpVerified:{
        type:Boolean,
        default:false
    },
    otpExpires:{
        type:Date

    }


},{timestamps:true})
const User = mongoose.model("User",userSchema)
export default User;
