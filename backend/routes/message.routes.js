import express from "express";
import { getMessages } from "../controllers/getm.controller.js";
import { sendMessage } from "../controllers/sendm.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/:id", verifyJWT, getMessages);

router.post("/send/:id", verifyJWT, sendMessage);

export default router;