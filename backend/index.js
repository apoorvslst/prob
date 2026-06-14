import dotenv from "dotenv";
import express from 'express';
import router from './routes/user.routes.js';
import path from "path";
import { fileURLToPath } from "url";
import postrouter from "./routes/post.routes.js";
import messagerouter from "./routes/message.routes.js";
import notificationRouter from "./routes/notification.routes.js";
import cors from 'cors';
import connectDB from "./db/index.js";
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { Message } from './db/Message.js';
import { Conversation } from './db/Conversation.js';

dotenv.config();

const app = express();
const PORT = 8000;

// CREATE THE EXPLICIT HTTP SERVER
const httpServer = createServer(app);

// Serve static files from the 'public/uploads' directory
app.use('/uploads', express.static('public/uploads'));

// ATTACH SOCKET.IO TO THAT SERVER
const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        credentials: true
    }
});

const userSocketMap = {}; // Format: { userId: socketId }

// 2. THE BRIDGE MIDDLEWARE
// This makes 'io' and the 'phonebook' available inside any route/controller!
app.use((req, res, next) => {
    req.io = io;
    req.userSocketMap = userSocketMap;
    next();
});

// ... your existing app.use(cors...), express.json(), cookie-parser(), routes...

// 3. LISTEN FOR CONNECTIONS & UPDATE PHONEBOOK
io.on("connection", (socket) => {
    console.log("🟢 A user connected! Socket ID:", socket.id);

    // When React connects, it will pass the user's database ID
    const userId = socket.handshake.query.userId;

    // Add them to the phonebook if they are logged in
    if (userId && userId !== "undefined") {
        userSocketMap[userId] = socket.id;
    }

    // Send the updated list of online users to everyone (great for green "Online" dots)
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // --- VIDEO CALL INVITE ---
    // User A sends { targetUserId, roomId, callerName } → forward to User B
    socket.on("video-call-invite", async ({ targetUserId, roomId, callerName }) => {
        console.log(`\n[DEBUG] video-call-invite received from ${userId}`);
        console.log(`[DEBUG] targetUserId: ${targetUserId}, roomId: ${roomId}, callerName: ${callerName}`);
        console.log(`[DEBUG] Current userSocketMap:`, userSocketMap);

        const targetSocketId = userSocketMap[targetUserId];
        if (targetSocketId) {
            io.to(targetSocketId).emit("video-call-invite", { roomId, callerName, callerId: userId });
            console.log(`📹 Video call invite sent: ${userId} → ${targetUserId} (socket: ${targetSocketId}, room: ${roomId})`);
        } else {
            console.log(`❌ Failed to send invite: User ${targetUserId} is not online (not in userSocketMap).`);
            
            try {
                let conversation = await Conversation.findOne({
                    participants: { $all: [userId, targetUserId] },
                });

                if (!conversation) {
                    conversation = await Conversation.create({
                        participants: [userId, targetUserId],
                    });
                }

                const newMessage = new Message({
                    senderId: userId,
                    receiverId: targetUserId,
                    message: "Missed video call",
                });

                if (newMessage) {
                    conversation.messages.push(newMessage._id);
                }
                await Promise.all([conversation.save(), newMessage.save()]);

                const callerSocketId = userSocketMap[userId];
                if (callerSocketId) {
                    io.to(callerSocketId).emit("newMessage", newMessage);
                    io.to(callerSocketId).emit("video-call-offline");
                }
            } catch (error) {
                console.error("Error creating missed call message:", error);
            }
        }
    });

    // User B declines → notify User A
    socket.on("video-call-decline", ({ callerId }) => {
        const callerSocketId = userSocketMap[callerId];
        if (callerSocketId) {
            io.to(callerSocketId).emit("video-call-declined");
        }
    });

    // If they disconnect, remove them from the phonebook
    socket.on("disconnect", () => {
        console.log("🔴 User disconnected:", socket.id);
        if (userId) {
            delete userSocketMap[userId];
        }
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});


const emailToSocketMapping = new Map();
const socketToEmailMapping = new Map();

io.on("connection", (socket) => {
    socket.on('join-room', data => {
        console.log("New Connection");
        const { roomId, emailId } = data;
        emailToSocketMapping.set(emailId, socket.id);
        socketToEmailMapping.set(socket.id, emailId);
        socket.join(roomId);
        socket.emit('joined-room', { roomId });
        socket.broadcast.to(roomId).emit('user-joined', { emailId });
        console.log(`${emailId} joined the room ${roomId}`);

    });
    socket.on('call-user', data => {
        const { emailId, offer } = data;
        const from = socketToEmailMapping.get(socket.id);
        const socketId = emailToSocketMapping.get(emailId);
        socket.to(socketId).emit("incoming-call", { from: from, offer: offer });
    });
    socket.on('call-accepted', data => {
        const { emailId, ans } = data;
        const socketId = emailToSocketMapping.get(emailId);
        const from = socketToEmailMapping.get(socket.id); // Get the email of the person answering
        socket.to(socketId).emit("call-accepted", { from, ans });
    });

    socket.on('ice-candidate', data => {
        const { emailId, candidate } = data;
        const socketId = emailToSocketMapping.get(emailId);
        if (socketId) {
            socket.to(socketId).emit("ice-candidate", { candidate });
        }
    });

    socket.on('end-call', data => {
        const { emailId } = data;
        const socketId = emailToSocketMapping.get(emailId);
        if (socketId) {
            socket.to(socketId).emit("end-call");
        }
    });
});

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/users', router); // Keep this line as is, but read the important note below
app.use('/api/post', postrouter);
app.use("/api/messages", messagerouter);
app.use("/api/notifications", notificationRouter);

const port = process.env.PORT || 8000;
connectDB().then(() => {
    httpServer.listen(port, () => {
        console.log(`Server is running at PORT ${port}`);
    })
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === "production") {
    // Serve frontend static files from build output
    app.use(express.static(path.join(__dirname, "../frontend/dist")));
    
    // Catch-all route to serve React's index.html for client-side routing
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
    });
} else {
    app.get('/', (req, res) => {
        return res.json({ status: "Server is running" });
    });
}
