import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Create from './pages/Create';
import Reels from './pages/Reels';
import Search from "./pages/Search";
import Profile from "./pages/Profile";
import Message from './pages/Message';
import Video from "./pages/Video";
import Room from "./pages/Room";
import Sidebar from './components/Sidebar';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css'
import { io } from 'socket.io-client';
import axios from 'axios';
import { SocketProvider } from './providers/Socket';
import { PeerProvider } from './providers/Peer';

// Set withCredentials globally — every axios request will now send cookies
axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';

// Intercept API responses globally to check if the cookie/token is missing or expired (401 Unauthorized)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If 401, it means cookie is missing or invalid.
      // Clear the state in localStorage and immediately redirect.
      localStorage.removeItem("user");
      if (window.location.pathname !== '/login') {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

function App() {
  const [authUser, setAuthUser] = useState(JSON.parse(localStorage.getItem("user")) || null);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (authUser) {
      const socketUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const newSocket = io(socketUrl, {
        query: { userId: authUser._id }
      });
      setSocket(newSocket);
      newSocket.on("getOnlineUsers", (users) => setOnlineUsers(users));
      return () => newSocket.disconnect();
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
  }, [authUser]);

  // Listen for real-time notifications
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification) => {
      console.log("New Notification Received:", notification);

      const sender = notification.senderId?.username || "Someone";
      let actionText = "";
      if (notification.type === "like") actionText = "liked your post";
      if (notification.type === "comment") actionText = "commented on your post";
      if (notification.type === "follow") actionText = "started following you";
      if (notification.type === "message") actionText = "sent you a message";

      // Simple browser alert to prove it works! 
      // (Later, you can swap this for a nice UI toast notification)
      alert(`${sender} ${actionText}!`);
    };

    socket.on("newNotification", handleNewNotification);

    return () => {
      socket.off("newNotification", handleNewNotification);
    };
  }, [socket]);

  // Check if user info is missing from local storage (authUser is null)
  useEffect(() => {
    const publicPaths = ['/login', '/register'];
    if (!authUser && !publicPaths.includes(window.location.pathname)) {
      window.location.href = "/login";
    }
  }, [authUser]);

  return (
    <>
      <Router>
        <div className="flex min-h-screen bg-black text-white">
          {/* Only show Sidebar if authUser exists and we aren't on login/register pages */}
          {authUser && <Sidebar authUser={authUser} />}

          <div className="flex-1">
            <SocketProvider>
              <PeerProvider>
                <Routes>

                  <Route path="/" element={<Home authUser={authUser} />} />
                  <Route path="/login" element={<Login setAuthUser={setAuthUser} />} />
                  <Route path="/register" element={<Register setAuthUser={setAuthUser} />} />
                  <Route path="/create" element={<Create />} />
                  <Route path="/reels" element={<Reels authUser={authUser} />} />
                  <Route path="/message" element={<Message authUser={authUser} socket={socket} />} />
                  <Route path="/search" element={<Search authUser={authUser} />} />
                  <Route path="/video" element={<Video authUser={authUser} />} />
                  <Route path="/profile/:username" element={<Profile />} />
                  <Route path="/room/:roomId" element={<Room authUser={authUser} />} />

                </Routes>
              </PeerProvider>
            </SocketProvider>
          </div>
        </div>
      </Router>
    </>
  );
}

export default App;