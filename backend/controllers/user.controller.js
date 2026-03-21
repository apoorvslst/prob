import {User} from '../db/User.js';

const registerUser=async(req,res)=>{
    try{
        const {username,email,password}=req.body;

        const existedUser=await User.findOne({$or : [{username},{email}]});
        if(existedUser){
            return res.status(409).json({ message: "User with email or username already exists" });
        }
        const user=await User.create({username,email,password});
        return res.status(201).json({ message: "User registered successfully!" });
    }
    catch(error){
        res.status(500).json({ error: error.message });
    }
}

const loginUser=async(req,res)=>{
    try{
        const {email,password}=req.body;

        const existedUser=await User.findOne({email});
        if(!existedUser || !(await existedUser.isPasswordCorrect(password))){
            return res.status(409).json({ message: "Invalid email or password" });
        }
        res.status(200).json({ message: "Login successful", username: existedUser.username });
    }
    catch(error){
        res.status(500).json({ error: error.message });
    }
}

export {registerUser,loginUser};