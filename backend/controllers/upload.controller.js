import { Post } from "../db/Post.js";
import { Notification } from "../db/Notification.js";

export const createPost = async (req, res) => {
    try {
        const { description, category, postType } = req.body;
        
        // Multer puts the array of files in req.files
        const uploadedFiles = req.files || [];

        if (uploadedFiles.length === 0 && !description) {
            return res.status(400).json({ message: "Post must contain media or a description" });
        }

        // Map uploaded files to our new media schema
        const mediaArray = uploadedFiles.map(file => {
            const isVideo = file.mimetype.startsWith('video/');
            return {
                url: '/uploads/' + file.filename,
                mediaType: isVideo ? 'video' : 'image'
            };
        });

        const newPost = await Post.create({
            description,
            category: category || "other",
            postType: postType || "post",
            media: mediaArray,
            owner: req.user._id
        });

        return res.status(201).json({ message: "Post uploaded!", post: newPost });
    } catch (error) {
        console.log("=== UPLOAD ERROR ===");
        console.log("Error message:", error.message);
        console.log("Full error:", error);
        return res.status(500).json({ message: "Upload failed", error: error.message });
    }
};

export const toggleLike = async (req, res) => {
    try {
        const postId = req.params.postId;
        const userId = req.user._id;
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: "Post not found" });
        const isLiked = post.likedBy.includes(userId);

        if (isLiked) {
            post.likedBy.pull(userId);
        } else {
            post.likedBy.push(userId); 
            
            // --- CREATE NOTIFICATION ---
            // Only notify if the user is liking someone else's post
            if (post.owner.toString() !== userId.toString()) {
                const newNotification = await Notification.create({
                    recipientId: post.owner,
                    senderId: userId,
                    type: "like",
                    postId: postId
                });

                // --- REAL-TIME PUSH ---
                const receiverSocketId = req.userSocketMap[post.owner.toString()];
                if (receiverSocketId) {
                    // Populate sender info so the frontend has everything it needs to show the popup
                    await newNotification.populate("senderId", "username profilePic");
                    req.io.to(receiverSocketId).emit("newNotification", newNotification);
                }
            }
        }
        
        await post.save();
        return res.status(200).json({ message: isLiked ? "Unliked" : "Liked", likedBy: post.likedBy });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};