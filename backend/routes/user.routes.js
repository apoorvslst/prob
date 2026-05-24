import {Router} from 'express';
import { registerUser, loginUser ,getUsersForSidebar, getUserProfile, followUnfollowUser, updateUserProfile, getUserPosts} from '../controllers/user.controller.js';
import { searchUsers, sendFriendRequest } from '../controllers/searchandreq.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const router=Router();

router.route("/register").post(upload.single("profilePic"), registerUser);
router.route("/login").post(loginUser);
router.route("/sidebar").get(verifyJWT,getUsersForSidebar);

// Search & Request Routes (Protected)
router.route("/search").get(verifyJWT, searchUsers);
router.route("/request/:id").post(verifyJWT, sendFriendRequest);

// Profile Routes (Mounted under /api/users)
router.route("/profile/:username").get(verifyJWT, getUserProfile);
router.route("/profile/update/me").put(verifyJWT, updateUserProfile);
router.route("/profile/follow/:id").post(verifyJWT, followUnfollowUser);
router.route("/profile/posts/:id").get(verifyJWT, getUserPosts);

export default router;