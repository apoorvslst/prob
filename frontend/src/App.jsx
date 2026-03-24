import { useState,useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Create from './pages/Create';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css'
import {io} from 'socket.io-client';

function App() {
  useEffect(() => {
    //  Connect to the backend
    // Replace the URL if your backend runs on a different port
    const socket = io("http://localhost:8000"); 

    // Cleanup function when the component unmounts
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <>
    <Router>
      <div className="min-h-screen bg-gray-100">
        {/* You can add a Navbar here later */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/create" element={<Create />} />
        </Routes>
      </div>
    </Router>
    </>
  )
}

export default App
