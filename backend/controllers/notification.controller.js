import { Notification } from "../db/Notification.js";

export const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id;

        // Fetch all notifications for this user, newest first
        const notifications = await Notification.find({ recipientId: userId })
            .sort({ createdAt: -1 })
            .populate("senderId", "username profilePic fullName")
            .populate("postId", "media"); // Grabs media so you can show a thumbnail if it's a like/comment

        res.status(200).json(notifications);
    } catch (error) {
        console.error("Error in getNotifications:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const markNotificationsAsRead = async (req, res) => {
    try {
        const userId = req.user._id;

        // Find all unread notifications for this user and mark them as read
        await Notification.updateMany(
            { recipientId: userId, isRead: false },
            { $set: { isRead: true } }
        );

        res.status(200).json({ message: "Notifications marked as read" });
    } catch (error) {
        console.error("Error in markNotificationsAsRead:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};
