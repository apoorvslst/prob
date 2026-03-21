import dotenv from "dotenv";
import express from 'express';
import router from './routes/user.routes.js';
import cors from 'cors';
import connectDB from "./db/index.js";

dotenv.config();


const app=express();
const PORT=8000;

app.use(cors()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/users',router);

connectDB().then(()=>{
    app.listen(8000,()=>{
        console.log("Server is running at PORT 8000");
    })
});

app.get('/',(req,res)=>{
    return res.json({status: "Server is running"});
});
