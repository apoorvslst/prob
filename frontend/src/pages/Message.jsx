import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';

const Message = ({ authUser, socket }) => {
    const location = useLocation();

    // --- STATE ---
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    
    // Hardcoded for UI testing based on your screenshot. 
    const [selectedUser, setSelectedUser] = useState({
        _id: "replace_with_meghraj_id", 
        username: "meghraj609_",
        fullName: "Meghraj Soni",
        profilePic: "https://via.placeholder.com/150" 
    });

    const messagesEndRef = useRef(null);

    // Sidebar navigation items
    const navItems = [
        { name: 'Home', path: '/' },
        { name: 'Search', path: '#'},
        { name: 'Explore', path: '#' },
        { name: 'Reels', path: '#', icon: '🎬' },
        { name: 'Messages', path: '/messages' },
        { name: 'Notifications', path: '#' },
        { name: 'Create', path: '/create' },
        { name: 'Profile', path: '#'},
    ];

    // --- 1. AUTO-SCROLL TO BOTTOM ---
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // --- 2. FETCH MESSAGE HISTORY ---
    useEffect(() => {
        if (!selectedUser) return;
        
        const fetchMessages = async () => {
            try {
                const res = await axios.get(`/api/messages/${selectedUser._id}`, {
                    withCredentials: true
                });
                setMessages(res.data);
            } catch (error) {
                console.error("Failed to fetch messages:", error);
            }
        };
        fetchMessages();
    }, [selectedUser]);

    // --- 3. LISTEN FOR REAL-TIME SOCKET MESSAGES ---
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (newMessage) => {
            if (selectedUser && newMessage.senderId === selectedUser._id) {
                setMessages((prev) => [...prev, newMessage]);
            }
        };

        socket.on("newMessage", handleNewMessage);
        return () => socket.off("newMessage", handleNewMessage);
    }, [socket, selectedUser]);

    // --- 4. SEND A MESSAGE ---
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputText.trim() || !selectedUser) return;

        try {
            const res = await axios.post(`/api/messages/send/${selectedUser._id}`, 
                { message: inputText },
                { withCredentials: true }
            );
            setMessages((prev) => [...prev, res.data]);
            setInputText(""); 
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    return (
        <div className="flex h-screen bg-black text-white overflow-hidden font-sans">
            
            {/* COLUMN 1: MAIN NAVIGATION SIDEBAR (Your Navbar) */}
            <div className="hidden md:flex flex-col w-[244px] border-r border-[#262626] p-4 justify-between h-full shrink-0">
                <div>
                    <div className="mb-8 mt-4 px-2">
                        <h1 className="text-xl font-bold tracking-wider italic font-serif">Instagram</h1>
                    </div>
                    <nav className="space-y-2">
                        {navItems.map((item, index) => {
                            const isActive = location.pathname === item.path || (item.name === 'Messages' && location.pathname.includes('messages'));
                            return (
                                <Link 
                                    key={index} 
                                    to={item.path} 
                                    className={`flex items-center gap-4 p-3 rounded-lg hover:bg-neutral-900 transition-all duration-200 group ${isActive ? 'font-bold' : ''}`}
                                >
                                    <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
                                    <span className="text-[15px]">{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
                <div className="space-y-2">
                    <Link to="#" className="flex items-center gap-4 p-3 rounded-lg hover:bg-neutral-900 transition-colors">
                        <span className="text-xl">≡</span>
                        <span className="text-[15px]">More</span>
                    </Link>
                </div>
            </div>

            {/* COLUMN 2: CONVERSATIONS LIST */}
            <div className="w-[350px] border-r border-[#262626] flex flex-col shrink-0">
                <div className="p-6 pt-8 font-bold text-xl flex justify-between items-center">
                    <span className="flex items-center gap-2 cursor-pointer">
                        {authUser?.username || "apoorv_slst"}
                        <span className="text-xs">▼</span>
                    </span>
                    <svg aria-label="New message" fill="currentColor" height="24" viewBox="0 0 24 24" width="24"><path d="M12.202 3.203H5.25a3 3 0 0 0-3 3V18.75a3 3 0 0 0 3 3h12.547a3 3 0 0 0 3-3v-6.952" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path><path d="M10.002 17.226H6.774v-3.228L18.607 2.165a1.417 1.417 0 0 1 2.004 0l1.224 1.225a1.417 1.417 0 0 1 0 2.004Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="px-6 flex justify-between text-base font-bold mb-4">
                        <span>Messages</span>
                        <span className="text-[#A8A8A8] font-normal cursor-pointer text-sm">Requests</span>
                    </div>

                    {/* Active Conversation Item */}
                    <div className="flex items-center gap-3 px-6 py-2 bg-[#121212] cursor-pointer">
                        <div className="relative">
                            <img src={selectedUser.profilePic} alt="User" className="w-14 h-14 rounded-full object-cover" />
                            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-black rounded-full"></div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold">{selectedUser.fullName}</span>
                            <span className="text-xs text-[#A8A8A8]">Active today</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* COLUMN 3: ACTIVE CHAT WINDOW */}
            <div className="flex-1 flex flex-col bg-black relative">
                
                {/* Chat Header */}
                <div className="h-[75px] border-b border-[#262626] flex items-center justify-between px-6">
                    <div className="flex items-center gap-3 cursor-pointer">
                        <img src={selectedUser.profilePic} className="w-11 h-11 rounded-full object-cover" alt="Profile" />
                        <div className="flex flex-col">
                            <span className="font-semibold text-sm">{selectedUser.fullName}</span>
                            <span className="text-[11px] text-[#A8A8A8]">{selectedUser.username}</span>
                        </div>
                    </div>
                    
                    <div className="flex gap-4 items-center">
                        <span className="cursor-pointer">📞</span>
                        <span className="cursor-pointer">📹</span>
                        <span className="cursor-pointer">ℹ️</span>
                    </div>
                </div>

                {/* Messages Feed */}
                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-2 scrollbar-hide">
                    {messages.map((msg, idx) => {
                        const isMe = msg.senderId === authUser?._id;
                        return (
                            <div key={idx} className={`max-w-[60%] flex flex-col ${isMe ? "self-end" : "self-start"}`}>
                                <div className={`px-4 py-2 rounded-3xl text-sm ${isMe ? "bg-[#3797F0] text-white" : "bg-[#262626] text-white"}`}>
                                    {msg.message}
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-6 pt-0">
                    <form onSubmit={handleSendMessage} className="flex items-center border border-[#363636] bg-black rounded-full px-4 py-2">
                        <span className="mr-3 cursor-pointer">😊</span>
                        <input 
                            type="text" 
                            placeholder="Message..." 
                            className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-[#A8A8A8]"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                        />
                        {inputText.trim() ? (
                            <button type="submit" className="text-[#3797F0] font-semibold text-sm px-2">Send</button>
                        ) : (
                            <div className="flex gap-3 text-xl px-2">
                                <span className="cursor-pointer">🎤</span>
                                <span className="cursor-pointer">🖼️</span>
                                <span className="cursor-pointer">❤️</span>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Message;