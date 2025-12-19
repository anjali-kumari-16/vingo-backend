//Authentication means verifying  who the user is 
/*When you log in to a website (like Gmail, IRCTC, Instagram),
you provide your email address and password.
The system checks:

Is this email address in the database?
Does the password match?

If yes, you grant access.

If no, you receive an "Invalid credentials" error.

This process is called authentication.*/
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import {genToken} from "../utils/token.js"

export const signIn =async (req,res) =>
    {
    try{
        const{email,password}=req.body//because  int the sign in form we have only email and password 
        const normalizedEmail = (email || "").toLowerCase().trim()
        //validation
        let user =await User.findOne({email: normalizedEmail})
        if(!user)
        {
            return res.status(400).json({message:"user does not exisit."})


        }
        const isMatch =await bcrypt.compare(password,user.password)
        //bcrypt ka matlab hota hai plain text password (jo user ne enter kiya) ko database me stored hashed password ke sath compare karna.
        if(!isMatch)
        {
            return res.status(400).json({message:"invalid password."})
        }
        const token=await genToken(user._id)
        res.cookie("token",token,
        {
            secure:false,
            sameSite:"strict",
            maxAge:7*24*60*60*1000,
            httpOnly:true//This means the cookie cannot be accessed via client side scripts,ensuringbetter security against cross-site scripting(XSS)

        })
        return res.status(200).json(user)
        /* Jab aap kisi site me login karte ho (jaise Amazon ya Gmail),
server ek cookie bhejta hai jisme aapka session ID hota hai.
Browser us cookie ko store kar leta hai,
aur jab aap next time request bhejte ho, to wo cookie automatically server ko wapas bhej di jati hai.*/




    }catch(error){
        return res.status(500).json(`sign in error ${error}`)
    }
}


 export const signUp = async (req,res) =>{
    try{
        const{fullName,email,password,mobileNumber,role}=req.body
        const normalizedEmail = (email || "").toLowerCase().trim()
        const normalizedFullName = (fullName || "").trim()
        //validation 
        const existingUser =await User.findOne({email: normalizedEmail})
        if(existingUser)
        {
            return res.status(400).json({message:"user allready exists."})

        }
        if(password.length<6)
        {
            return res.status(400).json({message:"password must be at length 6."})

        }
        if(mobileNumber.length<10)
        {
            return res.status(400).json({message:"invalid mobile number."})
        }
        //password hashing
        //hashing means converting a password into a fixed-length string of characters, which is typically a sequence of numbers and length letters.
        const hashedPassword =await bcrypt.hash(password,10)
        const newUser =await User.create({
            fullName: normalizedFullName,
            email: normalizedEmail,
            password:hashedPassword,
            mobileNumber,
            role
        })
        const token=await genToken(newUser._id)
        /*Cookies are small data files that the server sends to the browser and that the browser stores.

This data is sent back to the server with every request.

Used for:

To maintain a login session

To save user preferences or themes

For tracking and analytics */
        res.cookie("token",token,{
            secure:false,
            sameSite:"strict",
            maxAge:7*24*60*60*1000,//7d
            httpOnly:true
        })
        return res.status(201).json(newUser)

    }catch(error){
        if(error && (error.code === 11000 || error.code === '11000')){
            return res.status(400).json({message:"user allready exists."})
        }
        return res.status(500).json({message:"sign up error", error: String(error?.message || error)})
    }

}
export const signOut =async (req,res) =>{
    try{
        res.clearCookie("token")//Yeh line "token" naam wali cookie ko delete karti hai browser se.
        return res.status(200).json({message:"sign out successfully"})
        //status(200) ka matlab hai → Success (OK)

    }catch(error){
        return res.status(500).json(`sign out error ${error}`)
    }

}
export const sendOtp = async (req,res) =>{
    try{

    }
    catch(error)
    {

    }
}

