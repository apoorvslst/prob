import { User } from '../db/User.js';
import { Friendship } from '../db/Friendship.js';

export const searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        const currentUserId = req.user._id;

        const users = await User.find({
            _id: { $ne: currentUserId },
            $or: [
                { username: { $regex: query, $options: 'i' } },
                { fullName: { $regex: query, $options: 'i' } }
            ]
        }).select("username fullName profilePic");
        res.status(200).json(users);
    }
    catch (error) {
        res.status(500).json("Search failed");
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