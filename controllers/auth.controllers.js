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
import { genToken } from "../utils/token.js"
import { sendOtpMail } from "../utils/mail.js"
export const signIn = async (req, res) => {
    try {
        const { email, password } = req.body//because  int the sign in form we have only email and password 
        const normalizedEmail = (email || "").toLowerCase().trim()
        //validation
        let user = await User.findOne({ email: normalizedEmail })
        if (!user) {
            return res.status(400).json({ message: "user does not exisit." })


        }
        const isMatch = await bcrypt.compare(password, user.password)
        //bcrypt ka matlab hota hai plain text password (jo user ne enter kiya) ko database me stored hashed password ke sath compare karna.
        if (!isMatch) {
            return res.status(400).json({ message: "invalid password." })
        }
        const token = await genToken(user._id)
        res.cookie("token", token,
        {
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true//This means the cookie cannot be accessed via client side scripts,ensuringbetter security against cross-site scripting(XSS)

        })
        return res.status(200).json(user)
        /* Jab aap kisi site me login karte ho (jaise Amazon ya Gmail),
server ek cookie bhejta hai jisme aapka session ID hota hai.
Browser us cookie ko store kar leta hai,
aur jab aap next time request bhejte ho, to wo cookie automatically server ko wapas bhej di jati hai.*/
    } catch (error) {
        return res.status(500).json(`sign in error ${error}`)
    }
}


export const signUp = async (req, res) => {
    try {
        console.log("REQ BODY 👉", req.body);

        const { fullName, email, password, mobileNumber, role } = req.body;

        if (!fullName || !email || !password || !mobileNumber) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const normalizedEmail = (email || "").toLowerCase().trim();
        const normalizedFullName = (fullName || "").trim();

        //validation 
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists." });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters." });
        }
        if (mobileNumber.length < 10) {
            return res.status(400).json({ message: "Invalid mobile number." });
        }

        //password hashing
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            fullName,
            email,
            password: hashedPassword,
            mobileNumber,
            role: role || "user"
        });

        const token = await genToken(newUser._id);

        res.cookie("token", token, {
            secure: false, // Set to true in production with HTTPS
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,//7d
            httpOnly: true
        });

        console.log("User created successfully:", newUser);
        return res.status(201).json(newUser);

    } catch (error) {
        console.log("SIGNUP ERROR 👉", error);
        return res.status(500).json({ message: "Sign up error", error: String(error?.message || error) });
    }
}
// sign out
export const signOut = async (req, res) => {
    try {
        res.clearCookie("token")
        return res.status(200).json({ message: "Signed out successfully" });

    } catch (error) {
        return res.status(500).json(`sign out error ${error}`);
    }
}
//forgot password otp send
/*
export const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const normalizedEmail = (email || "").toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(400).json({ message: "User does not exist." });
        }
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        user.resetOtp = otp;
        user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes from now
        user.isOtpVerified = false;
        await user.save();
        await sendOtpMail(email, otp);
        return res.status(200).json({ message: "OTP sent successfully" });

    }
    catch (error) {
        console.error("Send OTP Error:", error);
        return res.status(500).json(`send otp error ${error}`);
}*/
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const normalizedEmail = (email || "").toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: "User does not exist." });
    }
     

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    user.resetOtp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 min
    user.isOtpVerified = false;
    await user.save();

    //  FIX: normalizedEmail use karo
    await sendOtpMail(normalizedEmail, otp);

    return res.status(200).json({ message: "OTP sent successfully" });

  } catch (error) {
    console.error("Send OTP Error:", error);
    return res.status(500).json({ message: "Failed to send OTP" });
  }
};

//verify otp
export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const normalizedEmail = (email || "").toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail });
        if (!user || user.resetOtp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired OTP." });
        }
        user.isOtpVerified = true
        user.resetOtp = undefined
        user.otpExpires = undefined
        await user.save()
        return res.status(200).json({ message: "otp verified successfully." })

    }
    catch (error) {
        return res.status(500).json(`verify otp error ${error}`)
    }
}
//reset password
export const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body
        const normalizedEmail = (email || "").toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail })
        if (!user || !user.isOtpVerified) {
            return res.status(400).json({ message: "otp verification required." })
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10)//“This line converts the user’s new password into a secure hashed format using bcrypt with 10 salt rounds before saving it to the database.”
        user.password = hashedPassword
        user.isOtpVerified = false
        await user.save()
        return res.status(200).json({ message: "password reset successfully." })

    }
    catch (error) {
        return res.status(500).json(`reset password error ${error}`)

    }
}

export const googleAuth = async (req, res) => {
    try {
        const { fullName, email, mobileNumber, role } = req.body;
        let user = await User.findOne({ email });

        if (!user ) {
            // Generate a random password since Google auth doesn't provide one
            const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(randomPassword, 10);

            user = await User.create({
                fullName,
                email,
                mobileNumber, // Map correctly to mobileNumber schema field
                role // Default to user if not provided
            });
        }

        const token = await genToken(user._id);
        res.cookie("token", token,{
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true
        });

        return res.status(200).json(user);

    } catch (error) {
        console.error("Google Auth Error:", error);
        return res.status(500).json({ message: "Google Auth error", error: String(error) });
    }
}


