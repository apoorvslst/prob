import { Message } from '../db/Message.js';
import { Conversation } from '../db/Conversation.js';
import { Notification } from '../db/Notification.js';

export const sendMessage = async (req, res) => {

    try {
        const { message } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        if (!message || !message.trim()) {
            return res.status(400).json({ error: "Message content cannot be empty" });
        }

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

        // --- CREATE NOTIFICATION ---
        const newNotification = await Notification.create({
            recipientId: receiverId,
            senderId: senderId,
            type: "message",
        });

        const receiverSocketId = req.userSocketMap[receiverId];

        // If they are online, send both the message and the notification!
        if (receiverSocketId) {
            // io.to(...).emit() sends a message to ONE specific user (updates Chat UI)
            req.io.to(receiverSocketId).emit("newMessage", newMessage);

            // Emit the notification (updates Global Notification Bell)
            await newNotification.populate("senderId", "username profilePic");
            req.io.to(receiverSocketId).emit("newNotification", newNotification);
        }
        // ----------------------------------------------------

        res.status(201).json(newMessage);
    }
    catch (error) {
        console.log("Error in sendMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }

}

export const markMessagesAsSeen = async (req, res) => {
    try {
        const currentUserId = req.user._id;
        const senderId = req.params.id;

        await Message.updateMany(
            { senderId: senderId, receiverId: currentUserId, status: { $ne: 'seen' } },
            { $set: { status: 'seen' } }
        );

        const senderSocketId = req.userSocketMap[senderId];
        if (senderSocketId) {
            req.io.to(senderSocketId).emit("messagesSeen", { receiverId: currentUserId });
        }
        return res.status(200).json({ message: "Messages marked as seen" });
    }
    catch (error) {
        console.error("Error marking messages as seen:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}