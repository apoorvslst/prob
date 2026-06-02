import dotenv from "dotenv";
import express from 'express';
import router from './routes/user.routes.js';
import postrouter from "./routes/post.routes.js";
import messagerouter from "./routes/message.routes.js";
import notificationRouter from "./routes/notification.routes.js";
import cors from 'cors';
import connectDB from "./db/index.js";
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';

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
        origin: process.env.CORS_ORIGIN || "http://localhost:5173",
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
    })
});

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/users', router); // Keep this line as is, but read the important note below
app.use('/api/post', postrouter);
app.use("/api/messages", messagerouter);
app.use("/api/notifications", notificationRouter);

connectDB().then(() => {
    httpServer.listen(8000, () => {
        console.log("Server is running at PORT 8000");
    })
});

app.get('/', (req, res) => {
    return res.json({ status: "Server is running" });
});
