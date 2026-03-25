import dotenv from "dotenv";
import express from 'express';
import router from './routes/user.routes.js';
import postrouter from "./routes/post.routes.js";
import messagerouter from "./routes/message.routes.js";
import cors from 'cors';
import connectDB from "./db/index.js";
import cookieParser from 'cookie-parser';
import { createServer } from 'http'; 
import { Server } from 'socket.io';



dotenv.config();


const app=express();
const PORT=8000;

// CREATE THE EXPLICIT HTTP SERVER
const httpServer = createServer(app);

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

app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/users',router);
app.use('/api/post',postrouter);
app.use("/api/messages", messagerouter);



connectDB().then(()=>{
    httpServer.listen(8000,()=>{
        console.log("Server is running at PORT 8000");
    })
});

app.get('/',(req,res)=>{
    return res.json({status: "Server is running"});
});
