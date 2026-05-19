import { Post } from "../db/Post.js";
import { User } from "../db/User.js";


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
                $in: following,
            }
        }).sort({ createdAt: -1 }).populate("owner", "username profilePic fullname");
        res.status(200).json(feedPosts);
    }
    catch (error) {
        console.log("Error in getting feed", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}