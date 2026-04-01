import { User } from '../models/User.js';
import { Friendship } from '../models/Friendship.js';

export const searchUsers=async(req,res)=>{
    try{
        const {query}=req.query;
        const currentuser=req.user._id;
        
        const users = await User.find({
            _id: { $ne: currentUserId },
            $or: [
                { username: { $regex: query, $options: 'i' } },
                { fullName: { $regex: query, $options: 'i' } }
            ]
        }).select("username fullName profilePic");
        res.status(200).json(users);
    }
    catch(error){
        res.status(500).json({"Search failed"});
    }
}