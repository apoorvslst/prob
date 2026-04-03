import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';
import { createPost } from '../controllers/upload.controller.js';
import { addComment } from '../controllers/addcomment.controller.js';


const postrouter = Router();
postrouter.route("/upload").post(
    verifyJWT,
    upload.single("photo"),
    createPost
);

// Add Comment Route (Protected)
postrouter.route("/comment/:postId").post(verifyJWT, addComment);

export default postrouter;