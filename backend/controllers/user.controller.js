import { User } from '../db/User.js';
import { Post } from '../db/Post.js';
import jwt from 'jsonwebtoken';

const registerUser = async (req, res) => {
    try {
        const { username, fullName, email, password, bio, link } = req.body;
        const profilePicLocalPath = req.file?.path; // Multer will put file info here

        const existedUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existedUser) {
            return res.status(409).json({ message: "User with email or username already exists" });
        }

        // Handle profile picture
        let profilePicUrl = "";
        if (profilePicLocalPath) {
            // In a real app, you'd upload this to Cloudinary/S3 and get a URL.
            // For local development, we'll use the path relative to the server's static files.
            profilePicUrl = `http://localhost:8000/uploads/${req.file.filename}`; 
        } else {
            profilePicUrl = "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"; // Default placeholder
        }

        const user = await User.create({ username, fullName, email, password, profilePic: profilePicUrl, bio, link });

        // GENERATE THE TOKEN (Same as login)
        const accessToken = jwt.sign(
            { _id: user._id, username: user.username },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '1d' }
        );

        // SET THE COOKIE
        const options = {
            httpOnly: true, // Frontend JS cannot touch this
            secure: false,  // Set to true only in production (requires HTTPS)
            sameSite: 'Lax', // Necessary for cross-port requests on localhost
            path: '/'       // Ensure cookie is sent on ALL routes, not just /api/users/
        };

        // Now the user is registered AND logged in immediately
        return res
            .status(201)
            .cookie("accessToken", accessToken, options)
            .json({
                message: "User registered and logged in successfully!", // Changed to include all user data
                user: { _id: user._id, username: user.username, email: user.email, profilePic: user.profilePic, fullName: user.fullName }
            });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find user
        const existedUser = await User.findOne({ email });

        // 2. Validate password
        if (!existedUser || !(await existedUser.isPasswordCorrect(password))) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // 3. Generate Access Token
        const accessToken = jwt.sign(
            { _id: existedUser._id, username: existedUser.username }, // Data inside token
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '1d' } // Token lasts for 1 day
        );

        // 4. Send token in a secure, hidden cookie
        const options = {
            httpOnly: true,
            secure: false,
            sameSite: 'Lax',
            path: '/'
        };


        return res
            .status(200)
            .cookie("accessToken", accessToken, options) // Set the cookie
            .json({
                message: "Login successful",
                user: { _id: existedUser._id, username: existedUser.username, email: existedUser.email, profilePic: existedUser.profilePic, fullName: existedUser.fullName }
            });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

const getUsersForSidebar=async (req,res)=>{
    try{
        const currentUserId = req.user._id;
        const users=await User.find({_id : {$ne:currentUserId}}).select("-password");
        return res.status(200).json(users);
 
    }
    catch(error){
        return res.status(500).json({error: error.message});
    }
}

const getUserProfile = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username }).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const followUnfollowUser = async (req, res) => {
    try {
        const { id: targetId } = req.params;
        const currentUserId = req.user._id;

        if (targetId === currentUserId.toString()) {
            return res.status(400).json({ message: "You cannot follow yourself" });
        }

        const targetUser = await User.findById(targetId);
        const currentUser = await User.findById(currentUserId);

        if (!targetUser || !currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const isFollowing = currentUser.following?.some(fid => fid.toString() === targetId);

        if (isFollowing) {
            // Atomic unfollow using Mongoose operators
            await User.findByIdAndUpdate(currentUserId, { $pull: { following: targetId } });
            await User.findByIdAndUpdate(targetId, { $pull: { followers: currentUserId } });
        } else {
            // Atomic follow using Mongoose operators ($addToSet avoids duplicates)
            await User.findByIdAndUpdate(currentUserId, { $addToSet: { following: targetId } });
            await User.findByIdAndUpdate(targetId, { $addToSet: { followers: currentUserId } });
        }

        return res.status(200).json({ message: isFollowing ? "Unfollowed" : "Followed" });
    } catch (error) {
        console.error("Follow/Unfollow Error:", error);
        return res.status(500).json({ error: error.message });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const { fullName, bio, link } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: { fullName, bio, link } },
            { new: true }
        ).select("-password");
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getUserPosts = async (req, res) => {
    try {
        const { id } = req.params;
        const posts = await Post.find({ owner: id }).sort({ createdAt: -1 });
        return res.status(200).json(posts);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export { registerUser, loginUser, getUsersForSidebar, getUserProfile, followUnfollowUser, updateUserProfile, getUserPosts };