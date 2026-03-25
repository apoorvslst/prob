import message from '../db/Message.js';
import { Conversation } from '../db/Conversation.js';

export const sendMessage=async(req,res)=>{

    try{
    const message=req.body;
    const {id:receiverId}=req.params;
    const senderId=req.user._id;

    let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId],
            });
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            message,
        });

        if (newMessage) {
            conversation.messages.push(newMessage._id);
        }
        await Promise.all([conversation.save(), newMessage.save()]);
        const receiverSocketId = req.userSocketMap[receiverId];
        
        // If they are online, send the message directly to them!
        if (receiverSocketId) {
            // io.to(...).emit() sends a message to ONE specific user
            req.io.to(receiverSocketId).emit("newMessage", newMessage);
        }
        // ----------------------------------------------------

        res.status(201).json(newMessage);
    }
    catch(error){
        console.log("Error in sendMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }

}