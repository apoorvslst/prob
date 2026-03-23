import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = async (req, res, next) => {
    try {
        // 1. Get the token from the cookie
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({ message: "Unauthorized request" });
        }

        // 2. Decode the token using your secret key
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // 3. Find the user in DB and attach them to the 'req' object
        const user = await User.findById(decodedToken?._id).select("-password");

        if (!user) {
            return res.status(401).json({ message: "Invalid Access Token" });
        }

        req.user = user; // Now req.user._id is available in your controller!
        next(); // Tell Express to move to the next function (the upload controller)

    } catch (error) {
        res.status(401).json({ message: "Invalid token", error: error.message });
    }
};