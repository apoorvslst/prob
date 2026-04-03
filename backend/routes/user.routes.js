import {Router} from 'express';
import { registerUser, loginUser } from '../controllers/user.controller.js';
import { searchUsers, sendFriendRequest } from '../controllers/searchandreq.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router=Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

// Search & Request Routes (Protected)
router.route("/search").get(verifyJWT, searchUsers);
router.route("/request/:id").post(verifyJWT, sendFriendRequest);


export default router;