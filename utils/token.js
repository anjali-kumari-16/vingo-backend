//token is a small piece of code that is proves a user identify after login
//This token tells the backend:-
/*
i am the same user as the one i logged in with before 
That is the token is proof of identity
*/ 
import jwt from "jsonwebtoken"
export const genToken =async (userId)=>{
    try{
        const token =await jwt.sign({userId},process.env.JWT_SECRET,{expiresIn:"7d"})
        return token

    }catch(error){
        console.log(error)
    }
}