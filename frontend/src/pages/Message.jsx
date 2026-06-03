import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSocket } from '../providers/Socket';

const Message = ({ authUser, socket }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const videoSocket = useSocket();

    // --- STATE ---
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [chatUsers, setChatUsers] = useState([]); // List of users for the sidebar
    const [selectedUser, setSelectedUser] = useState(null); // No one is selected initially
    const [incomingCall, setIncomingCall] = useState(null); // { roomId, callerName, callerId }
    
    const messagesEndRef = useRef(null);

    // --- VIDEO CALL: SEND INVITE ---
    const handleVideoCall = useCallback(() => {
        if (!selectedUser || !authUser || !socket) return;
        const ids = [authUser._id, selectedUser._id].sort();
        const roomId = ids.join('_');
        // Send invite to the other user via main socket (has userSocketMap)
        socket.emit('video-call-invite', {
            targetUserId: selectedUser._id,
            roomId,
            callerName: authUser.fullName || authUser.username
        });
        // Also join the room yourself via the WebRTC socket
        videoSocket.emit('join-room', { emailId: authUser.email || authUser.username, roomId });
    }, [selectedUser, authUser, socket, videoSocket]);

    // Navigate when WebRTC socket confirms room join
    useEffect(() => {
        if (!videoSocket) return;
        const handleRoomJoined = ({ roomId }) => {
            navigate(`/room/${roomId}`);
        };
        videoSocket.on('joined-room', handleRoomJoined);
        return () => videoSocket.off('joined-room', handleRoomJoined);
    }, [videoSocket, navigate]);

    // --- VIDEO CALL: LISTEN FOR INCOMING INVITE ---
    useEffect(() => {
        if (!socket) return;

        const handleIncomingCall = ({ roomId, callerName, callerId }) => {
            setIncomingCall({ roomId, callerName, callerId });
        };

        const handleCallDeclined = () => {
            alert('Your call was declined.');
        };

        socket.on('video-call-invite', handleIncomingCall);
        socket.on('video-call-declined', handleCallDeclined);
        return () => {
            socket.off('video-call-invite', handleIncomingCall);
            socket.off('video-call-declined', handleCallDeclined);
        };
    }, [socket]);

    // Accept incoming call
    const handleAcceptCall = useCallback(() => {
        if (!incomingCall || !authUser) return;
        videoSocket.emit('join-room', { emailId: authUser.email || authUser.username, roomId: incomingCall.roomId });
        setIncomingCall(null);
    }, [incomingCall, authUser, videoSocket]);

    // Decline incoming call
    const handleDeclineCall = useCallback(() => {
        if (!incomingCall || !socket) return;
        socket.emit('video-call-decline', { callerId: incomingCall.callerId });
        setIncomingCall(null);
    }, [incomingCall, socket]);

    // Handle navigation from Profile page to select a user automatically
    useEffect(() => {
        if (location.state?.selectedUser) {
            setSelectedUser(location.state.selectedUser);
        }
    }, [location.state]);

    // --- 1. FETCH USERS FOR SIDEBAR ---
    useEffect(() => {
        const fetchSidebarUsers = async () => {
            try {
                // Fetching from your brand new backend route!
                const res = await axios.get("/api/users/sidebar", {
                    withCredentials: true
                });
                setChatUsers(res.data);
            } catch (error) {
                console.error("Failed to fetch chat users:", error);
            }
        };
        fetchSidebarUsers();
    }, []);

    // --- 2. AUTO-SCROLL TO BOTTOM ---
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // --- 3. FETCH MESSAGE HISTORY ---
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

    // --- NEW: MARK MESSAGES AS SEEN ---
    useEffect(() => {
        if (!selectedUser || !authUser || messages.length === 0) return;

        const lastMessage = messages[messages.length - 1];
        
        if (lastMessage.senderId === selectedUser._id && lastMessage.status !== 'seen') {
            const markAsSeen = async () => {
                try {
                    await axios.put(`/api/messages/${selectedUser._id}`, {}, {
                        withCredentials: true
                    });
                    
                    setMessages(prev => prev.map(msg => 
                        msg.senderId === selectedUser._id ? { ...msg, status: 'seen' } : msg
                    ));
                } catch (error) {
                    console.error("Failed to mark messages as seen:", error);
                }
            };
            markAsSeen();
        }
    }, [messages, selectedUser, authUser]);

    // --- NEW: LISTEN FOR SEEN CONFIRMATION ---
    useEffect(() => {
        if (!socket) return;

        const handleMessagesSeen = ({ receiverId }) => {
            if (selectedUser && receiverId === selectedUser._id) {
                setMessages(prev => prev.map(msg => {
                    if (msg.senderId === authUser._id) {
                        return { ...msg, status: 'seen' };
                    }
                    return msg;
                }));
            }
        };

        socket.on("messagesSeen", handleMessagesSeen);
        return () => socket.off("messagesSeen", handleMessagesSeen);
    }, [socket, selectedUser, authUser]);

    // --- 4. LISTEN FOR REAL-TIME SOCKET MESSAGES ---
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

    // --- 5. SEND A MESSAGE ---
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

            {/* COLUMN 2: CONVERSATIONS LIST */}
            <div className="w-[350px] border-r border-[#262626] flex flex-col shrink-0">
                <div className="p-6 pt-8 font-bold text-xl flex justify-between items-center">
                    <span className="flex items-center gap-2 cursor-pointer">
                        {authUser?.username || "Chats"}
                    </span>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="px-6 flex justify-between text-base font-bold mb-4">
                        <span>Messages</span>
                    </div>

                    {/* Loop through the users we fetched from backend */}
                    {chatUsers.map((user) => (
                        <div 
                            key={user._id}
                            onClick={() => setSelectedUser(user)}
                            className={`flex items-center gap-3 px-6 py-3 cursor-pointer hover:bg-[#121212] transition-colors ${selectedUser?._id === user._id ? 'bg-[#121212]' : ''}`}
                        >
                            <div className="relative">
                                <img src={user.profilePic || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"} alt="User" className="w-14 h-14 rounded-full object-cover border border-[#262626]" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold">{user.fullName || user.username}</span>
                                <span className="text-xs text-[#A8A8A8]">{user.username}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* COLUMN 3: ACTIVE CHAT WINDOW */}
            <div className="flex-1 flex flex-col bg-black relative">
                {!selectedUser ? (
                    /* PLACEHOLDER WHEN NO ONE IS SELECTED */
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                        <div className="w-24 h-24 border-2 border-white rounded-full flex items-center justify-center mb-4">
                            <svg aria-label="Direct" className="x1lliihq x1n2onr6 x5n08af" fill="currentColor" height="60" role="img" viewBox="0 0 96 96" width="60"><title>Direct</title><path d="M48 0C21.532 0 0 21.533 0 48s21.532 48 48 48 48-21.532 48-48S74.468 0 48 0Zm0 94C22.636 94 2 73.364 2 48S22.636 2 48 2s46 20.636 46 46-20.636 46-46 46Zm12.227-53.284-7.257 12.144a3.449 3.449 0 0 1-5.022 1.042l-10.364-7.773a1 1 0 0 0-1.2.046l-9.155 8.163a.5.5 0 0 1-.8-.584l7.257-12.144a3.449 3.449 0 0 1 5.022-1.042l10.364 7.773a1 1 0 0 0 1.2-.046l9.155-8.163a.5.5 0 0 1 .8.584Z"></path></svg>
                        </div>
                        <h2 className="text-xl font-medium">Your Messages</h2>
                        <p className="text-[#A8A8A8] mt-2">Send private photos and messages to a friend.</p>
                    </div>
                ) : (
                    /* ACTUAL CHAT WINDOW */
                    <>
                        {/* Chat Header */}
                        <div className="h-[75px] border-b border-[#262626] flex items-center px-6 gap-3">
                            <img src={selectedUser.profilePic || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"} className="w-11 h-11 rounded-full object-cover" alt="Profile" />
                            <div className="flex flex-col flex-1">
                                <span className="font-semibold text-sm">{selectedUser.fullName || selectedUser.username}</span>
                            </div>
                            {/* Video Call Button */}
                            <button
                                onClick={handleVideoCall}
                                className="p-2 rounded-full hover:bg-[#262626] transition-colors cursor-pointer group"
                                title="Start video call"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white group-hover:text-[#3797F0] transition-colors">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                                </svg>
                            </button>
                        </div>

                        {/* Messages Feed */}
                        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-2 scrollbar-hide">
                            {messages.map((msg, idx) => {
                                const isMe = msg.senderId === authUser?._id;
                                const isLastMessage = idx === messages.length - 1;
                                return (
                                    <div key={idx} className={`max-w-[60%] flex flex-col ${isMe ? "self-end" : "self-start"}`}>
                                        <div className={`px-4 py-2 rounded-3xl text-sm ${isMe ? "bg-[#3797F0] text-white" : "bg-[#262626] text-white"}`}>
                                            {msg.message}
                                        </div>
                                        {isMe && isLastMessage && msg.status === 'seen' && (
                                            <span className="text-[11px] text-[#A8A8A8] self-end mt-1 mr-2">
                                                Seen
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <div className="p-6 pt-0 mt-4">
                            <form onSubmit={handleSendMessage} className="flex items-center border border-[#363636] bg-black rounded-full px-4 py-2">
                                <input
                                    type="text"
                                    placeholder="Message..."
                                    className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-[#A8A8A8]"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                />
                                {inputText.trim() && (
                                    <button type="submit" className="text-[#3797F0] font-semibold text-sm px-2">Send</button>
                                )}
                            </form>
                        </div>
                    </>
                )}
            </div>

            {/* INCOMING CALL OVERLAY */}
            {incomingCall && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-[#1a1a1a] border border-[#363636] rounded-2xl p-8 flex flex-col items-center gap-5 shadow-2xl min-w-[320px]">
                        {/* Pulsing call icon */}
                        <div className="w-20 h-20 rounded-full bg-[#3797F0]/20 flex items-center justify-center animate-pulse">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-[#3797F0]">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                            </svg>
                        </div>
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-white">Incoming Video Call</h3>
                            <p className="text-[#A8A8A8] text-sm mt-1">{incomingCall.callerName} is calling you</p>
                        </div>
                        <div className="flex gap-4 mt-2">
                            <button
                                onClick={handleDeclineCall}
                                className="px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-colors cursor-pointer"
                            >
                                Decline
                            </button>
                            <button
                                onClick={handleAcceptCall}
                                className="px-6 py-2.5 rounded-full bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition-colors cursor-pointer"
                            >
                                Accept
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Message;