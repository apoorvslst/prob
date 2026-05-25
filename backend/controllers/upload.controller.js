import { Post } from "../db/Post.js";

export const createPost = async (req, res) => {
    try {
        const { description } = req.body;
        const photoPath = req.file?.path; // Path from Multer

        if (!photoPath) {
            return res.status(400).json({ message: "Photo is required" });
        }

        // Store the web-accessible URL, not the raw disk path
        const photoUrl = '/uploads/' + req.file.filename;

        const newPost = await Post.create({
            description,
            photo: photoUrl,
            owner: req.user._id
        });

        return res.status(201).json({ message: "Post uploaded!", post: newPost });
    } catch (error) {
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
        }
        
        await post.save();
        return res.status(200).json({ message: isLiked ? "Unliked" : "Liked", likedBy: post.likedBy });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};