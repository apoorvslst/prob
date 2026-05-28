import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
    recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    type: {
        type: String,
        enum: ["like", "comment", "follow", "message"],
        required: true,
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        // Not required, because a "follow" notification won't have a post!
    },
    isRead: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });

export const Notification = mongoose.model("Notification", NotificationSchema);
