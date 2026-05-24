import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';
import { createPost, toggleLike } from '../controllers/upload.controller.js';
import { addComment } from '../controllers/addcomment.controller.js';
import { getFeedPost } from '../controllers/feed.controller.js';


const postrouter = Router();
postrouter.route("/upload").post(
    verifyJWT,
    upload.single("photo"),
    createPost
);
postrouter.route("/like/:postId").post(verifyJWT, toggleLike);

// Feed Route
postrouter.route("/feed").get(verifyJWT, getFeedPost);

// Add Comment Route (Protected)
postrouter.route("/comment/:postId").post(verifyJWT, addComment);

export default postrouter;