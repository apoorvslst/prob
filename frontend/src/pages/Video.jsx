import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import React from "react";
import { useSocket } from "../providers/Socket";

const Video = ({ authUser }) => {
    const socket = useSocket();
    const [email, setEmail] = useState("");
    const [roomId, setRoomId] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        socket.on('joined-room', handleRoomJoined)
    }, [socket]);

    const handleRoomJoined = ({ roomId }) => {
        navigate(`/room/${roomId}`);
    }

    const handleJoinRoom = () => {
        socket.emit('join-room', { emailId: email, roomId: roomId });
    };


    return (
        <div className="homepage-container flex items-center justify-center h-screen">
            <div className="input-container flex flex-col items-center justify-center gap-4">
                <input className="text-2xl w-70% border-white p-2" value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Enter your email here" />
                <input className="text-2xl w-70% border-white p-2" value={roomId} onChange={e => setRoomId(e.target.value)} type="text" placeholder="Enter room code" />
                <button className="text-2xl bg-white text-black cursor-pointer p-2 rounded-lg w-20%" onClick={handleJoinRoom} >Enter Room</button>
            </div>
        </div>
    );
}

export default Video;