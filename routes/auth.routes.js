import express from 'express';
import {
  signUp,
  signIn,
  signOut,
  sendOtp,
  verifyOtp,
  resetPassword,
  googleAuth
} from "../controllers/auth.controllers.js";

const authRouter =express.Router();
//signup route
authRouter.post('/signup',signUp);
//signin route
authRouter.post('/signin',signIn);
//signout route
authRouter.get('/signout',signOut);
//forgot password otp send route
authRouter.post('/send-otp',sendOtp);
//verify otp route
authRouter.post('/verify-otp',verifyOtp);
//reset password route
authRouter.post('/reset-password',resetPassword);
authRouter.post('/google-auth',googleAuth);



 


export default authRouter;

