
import dotenv from "dotenv";
dotenv.config(); 

import express from "express";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.route.js";
import videoRouter from "./routes/video.route.js";
import commentRouter from "./routes/comment.route.js";
import accountRouter from "./routes/account.route.js"
import cors from "cors";



const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:true}));

const corsOption={
    origin:"http://localhost:3000",
    credentials:true
}

app.use(cors(corsOption))

const PORT = process.env.PORT || 3000;

app.use('/api/v1/auth',userRouter);
app.use('/api/v1/',videoRouter);
app.use('/api/v1/',commentRouter)
app.use('/api/v1/',accountRouter)

app.listen(PORT,()=>{
  
    console.log(`server running at port ${PORT}`)
});