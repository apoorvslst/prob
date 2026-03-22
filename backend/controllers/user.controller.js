import {User} from '../db/User.js';
import jwt from 'jsonwebtoken';

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

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find user
        const existedUser = await User.findOne({ email });
        
        // 2. Validate password
        if (!existedUser || !(await existedUser.isPasswordCorrect(password))) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // 3. Generate Access Token
        const accessToken = jwt.sign(
            { _id: existedUser._id, username: existedUser.username }, // Data inside token
            process.env.ACCESS_TOKEN_SECRET, 
            { expiresIn: '1d' } // Token lasts for 1 day
        );

        // 4. Send token in a secure, hidden cookie
        const options = {
            httpOnly: true, // Frontend JS cannot touch this (Prevents XSS)
            secure: true    // Only works over HTTPS (or localhost)
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, options) // Set the cookie
            .json({ 
                message: "Login successful", 
                user: { username: existedUser.username, email: existedUser.email } 
            });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export {registerUser,loginUser};