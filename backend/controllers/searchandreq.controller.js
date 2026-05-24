import { User } from '../db/User.js';
import { Friendship } from '../db/Friendship.js';

export const searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        const currentUserId = req.user._id;

        // 1. Guard against empty queries
        if (!query || typeof query !== 'string') {
            return res.status(200).json([]);
        }

        // 2. Clean the query to prevent accidental whitespace issues
        const safeQuery = query.trim();

        const users = await User.find({
            _id: { $ne: currentUserId },
            $or: [
                { username: { $regex: safeQuery, $options: 'i' } },
                { fullName: { $regex: safeQuery, $options: 'i' } }
            ]
        }).select("username fullName profilePic followers");
        
        res.status(200).json(users);   
    }
    catch (error) {
        res.status(500).json({ error: "Search failed", message: error.message });
    }
}

export const sendFriendRequest = async (req, res) => {
    try {
        const sender = req.user._id;
        const receiver = req.params.id;

        const existingRequest = await Friendship.findOne({
            $or: [
                { sender: sender, receiver: receiver },
                { sender: receiver, receiver: sender }
            ]
        })
        if (!existingRequest) {
            const newreq = await Friendship.create({
                sender: sender,
                receiver: receiver,
                status: 'pending'
            })
            res.status(201).json({ message: "Request sent!", newreq });
        }
    }
    catch (error) {
        res.status(500).json({ error: "Could not send the request" });
    }
}