import { Router } from 'express';
import { getProfile, updateProfile, toggleFollow, getUserPosts } from '../controllers/profile.controllers.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// 1. Get Profile Details (by username)
router.route("/:username").get(verifyJWT, getProfile);

// 2. Update Logged-In User's Profile
router.route("/update/me").put(verifyJWT, updateProfile);

// 3. Toggle Follow/Unfollow User (by user ID)
router.route("/follow/:id").post(verifyJWT, toggleFollow);

// 4. Get All Posts for a Specific User (by user ID)
router.route("/posts/:id").get(verifyJWT, getUserPosts);

export default router;
