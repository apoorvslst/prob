import {Router} from 'express';
import jwt from 'jsonwebtoken';
import {verifyJWT} from '../middlewares/auth.middleware.js';
import {upload} from '../middlewares/multer.middleware.js';
import {createPost} from '../controllers/upload.controller.js';


const postrouter=Router();
postrouter.route("/upload").post(
    verifyJWT,
    upload.single("photo"),
    createPost       
);

export default postrouter;