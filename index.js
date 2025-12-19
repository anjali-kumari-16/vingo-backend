import express from "express"
import dotenv from "dotenv"

dotenv.config()
import connectDb from "./config/db.js"
import cookieParser from "cookie-parser"
import authRouter from "./routes/auth.routes.js"
import cors from "cors"
const app =express()
const port=process.env.PORT || 5000
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175","http://localhost:5176", "http://localhost:5177"],
    credentials: true
}));

app.use(express.json())
app.use(cookieParser())
app.use("/api/auth",authRouter)
app.listen(port,()=>{
    connectDb()
    console.log(`server is running on port ${port}`);

})
