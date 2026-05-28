import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getNotifications, markNotificationsAsRead } from "../controllers/notification.controller.js";

const notificationRouter = Router();

// Get all notifications for the logged-in user
notificationRouter.route("/").get(verifyJWT, getNotifications);

// Mark all unread notifications as read
notificationRouter.route("/mark-read").put(verifyJWT, markNotificationsAsRead);

export default notificationRouter;
