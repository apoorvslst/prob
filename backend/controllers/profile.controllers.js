import { User } from '../db/User.js';
import { Post } from '../db/Post.js';

export const getProfile = async (req, res) => {
    try {
        const targetUsername = req.params.username;
        const targetUser = await User.findOne({
            username: targetUsername
        }).select("-password");
        if (!targetUser) {
            res.status(404).json("User not found");
        }
        return res.status(200).json(targetUser);
    }
    catch (error) {
        return res.status(500).json("Error fetching profile");
    }
}

export const updateProfile = async (req, res) => {
    try {
        const currentUser = req.user._id;
        const { fullName, bio, link } = req.body;

        const user = await User.findOne({
            _id: currentUser
        });
        if (!user) {
            return res.status(404).json("User not found");
        }
        if (fullName) {
            user.fullName = fullName;
        }
        if (bio) {
            user.bio = bio;
        }
        if (link) {
            user.link = link;
        }
        await user.save();
        return res.status(200).json("User profile updated");
    }
    catch (error) {
        return res.status(500).json({ error: "Error updating profile" });
    }
}

export const toggleFollow = async (req, res) => {
    try {
        const currentUser = req.user._id;
        const targetUser = req.params.id;

        const user = await User.findOne({
            _id: targetUser,
            followers: currentUser
        });

        if (user) {
            await User.findByIdAndUpdate(targetUser, {
                $pull: { followers: currentUser }
            });
            await User.findByIdAndUpdate(currentUser, {
                $pull: { following: targetUser }
            });
            return res.status(200).json("Successfully Unfollowed");
        }

        await User.findByIdAndUpdate(targetUser, {
            $addToSet: { followers: currentUser }
        });
        await User.findByIdAndUpdate(currentUser, {
            $addToSet: { following: targetUser }
        });
        return res.status(200).json("Successfully Followed");
    }
    catch (error) {
        return res.status(500).json({ error: "Error following/unfollowing" });
    }
}

export const getUserPosts = async (req, res) => {
    try {
        const owner = req.params.id;

        const posts = await Post.find({
            owner: owner
        });
        if (!posts) {
            return res.status(404).json("User has no posts yet");
        }
        return res.status(200).json(posts);
    }
    catch (error) {
        return res.status(500).json({ error: "Error fetching posts" });
    }
}