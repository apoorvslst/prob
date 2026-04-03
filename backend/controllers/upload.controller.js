import { Post } from "../db/Post.js";

export const createPost = async (req, res) => {
    try {
        const { description } = req.body;
        const photoPath = req.file?.path; // Path from Multer

        if (!photoPath) {
            return res.status(400).json({ message: "Photo is required" });
        }

        const newPost = await Post.create({
            description,
            photo: photoPath, // Later, you'll swap this for a Cloudinary URL
            owner: req.user._id // Assumes you have auth middleware
        });

        return res.status(201).json({ message: "Post uploaded!", post: newPost });
    } catch (error) {
        return res.status(500).json({ message: "Upload failed", error: error.message });
    }
};