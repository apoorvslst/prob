import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';
import { createPost, toggleLike } from '../controllers/upload.controller.js';
import { addComment } from '../controllers/addcomment.controller.js';
import { getFeedPost, getReels } from '../controllers/feed.controller.js';

const postrouter = Router();
postrouter.route("/upload").post(
    verifyJWT,
    (req, res, next) => {
        upload.array("media", 10)(req, res, (err) => {
            if (err) {
                console.log("=== MULTER ERROR ===");
                console.log("Error:", err.message);
                console.log("Full:", err);
                return res.status(500).json({ message: "Multer upload failed", error: err.message });
            }
            next();
        });
    },
    createPost
);
postrouter.route("/like/:postId").post(verifyJWT, toggleLike);

// Feed Route
postrouter.route("/feed").get(verifyJWT, getFeedPost);

// Get Reels Route
postrouter.route("/reels").get(verifyJWT, getReels);

// Add Comment Route (Protected)
postrouter.route("/comment/:postId").post(verifyJWT, addComment);

export default postrouter;