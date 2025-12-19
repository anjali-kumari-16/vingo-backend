import express from 'express';
import {signUp} from '../controllers/auth.controllers.js';
import {signIn} from '../controllers/auth.controllers.js';
import {signOut} from '../controllers/auth.controllers.js';
const authRouter =express.Router();
//signup route
authRouter.post('/signup',signUp);
//signin route
authRouter.post('/signin',signIn);
//signout route
authRouter.get('/signout',signOut);
export default authRouter;
