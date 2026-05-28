import { Post } from "../db/Post.js";
import { User } from "../db/User.js";
import { Comment } from "../db/Comment.js";


export const getFeedPost = async (req, res) => {
    try {
        const currentUser = req.user._id;
        const user = await User.findById(currentUser);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const following = user.following;
        const feedPosts = await Post.find({
            owner: {
                $in: [...following, currentUser],
            }
        }).sort({ createdAt: -1 })
          .populate("owner", "username profilePic fullName")
          .populate({
            path: "comments",
            populate: {
                path: "user",
                select: "username profilePic fullName"
            }
          });
        res.status(200).json(feedPosts);
    }
    catch (error) {
        console.log("Error in getting feed", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const getReels = async (req, res) => {
    try {
        const reels = await Post.find({ postType: 'reel' })
            .populate("owner", "username profilePic")
            .populate({
                path: "comments",
                populate: {
                    path: "user",
                    select: "username profilePic fullName"
                }
            })
            .sort({ createdAt: -1 });

        return res.status(200).json(reels);
    } catch (error) {
        console.error("Error in getReels:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};