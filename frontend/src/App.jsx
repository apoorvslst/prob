import { useState,useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Create from './pages/Create';
import Search from "./pages/Search";
import Profile from "./pages/Profile";
import Message from './pages/Message';
import Sidebar from './components/Sidebar';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css'
import {io} from 'socket.io-client';
import axios from 'axios';

// Set withCredentials globally — every axios request will now send cookies
axios.defaults.withCredentials = true;

function App() {
  const [authUser, setAuthUser] = useState(JSON.parse(localStorage.getItem("user")) || null);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (authUser) {
        const newSocket = io("http://localhost:8000", {
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

  return (
    <>
    <Router>
        <div className="flex min-h-screen bg-black text-white">
            {/* Only show Sidebar if authUser exists and we aren't on login/register pages */}
            {authUser && <Sidebar authUser={authUser} />}
            
            <div className="flex-1">
                <Routes>
                    <Route path="/" element={<Home authUser={authUser} />} />
                    <Route path="/login" element={<Login setAuthUser={setAuthUser} />} />
                    <Route path="/register" element={<Register setAuthUser={setAuthUser} />} />
                    <Route path="/create" element={<Create />} />
                    <Route path="/message" element={<Message authUser={authUser} socket={socket} />} />
                    <Route path="/search" element={<Search authUser={authUser} />} />
                    <Route path="/profile/:username" element={<Profile />} />
                </Routes>
            </div>
        </div>
    </Router>
    </>
  );
}

export default App;