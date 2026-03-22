import {Router} from 'express';

const postrouter=Router();
postrouter.route("/upload").post(
    verifyJWT,
    upload.single("photo"),
    createPost       
);

export default postrouter;