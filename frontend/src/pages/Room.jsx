import React, { useEffect, useCallback, useState, useRef } from "react";
import { useSocket } from "../providers/Socket"
import { usePeer } from "../providers/Peer";
import { useParams } from "react-router-dom"

const VideoPlayer = ({ stream, muted }) => {
    const videoRef = useRef(null);
    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);
    return (
        <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={muted}
            className="absolute top-0 left-0 w-full h-full object-cover"
        />
    );
};

const Room = () => {
    const socket = useSocket();
    const { peer, createOffer, createAnswer, setRemoteAnswer, sendStream, remoteStream } = usePeer();
    const params = useParams();

    const [myStream, setMyStream] = useState(null);
    const [remoteEmailId, setRemoteEmailId] = useState(null);

    // Sync promise to ensure we don't negotiate WebRTC before the camera is fully on
    const streamReadyPromiseRef = useRef(null);
    const streamReadyResolveRef = useRef(null);
    if (!streamReadyPromiseRef.current) {
        streamReadyPromiseRef.current = new Promise((resolve) => {
            streamReadyResolveRef.current = resolve;
        });
    }

    const handleNewUserJoined = useCallback(async (data) => {
        const { emailId } = data;
        console.log("new user joined", emailId);
        setRemoteEmailId(emailId);
        await streamReadyPromiseRef.current; // Wait for camera
        const offer = await createOffer();
        socket.emit("call-user", { emailId, offer });
    }, [createOffer, socket]);

    const handleIncomingCall = useCallback(async ({ from, offer }) => {
        console.log('incoming call', from, offer);
        await streamReadyPromiseRef.current; // Wait for camera
        const ans = await createAnswer(offer);
        socket.emit('call-accepted', { emailId: from, ans });
        setRemoteEmailId(from);
    }, [createAnswer, socket]);

    const handleCallAccepted = useCallback(async (data) => {
        const { ans } = data;
        console.log("Call got accepted", ans);
        await setRemoteAnswer(ans);
    }, [setRemoteAnswer]);

    const getUserMediaStream = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            setMyStream(stream);
            await sendStream(stream);
            streamReadyResolveRef.current(stream);
        } catch (err) {
            console.error("Failed to get camera:", err);
        }
    }, [sendStream]);

    // End call cleanup
    const handleEndCall = useCallback(() => {
        if (remoteEmailId) {
            socket.emit('end-call', { emailId: remoteEmailId });
        }
        if (myStream) {
            myStream.getTracks().forEach(track => track.stop());
        }
        window.location.href = '/message'; // Hard redirect to reset global Peer connection state
    }, [remoteEmailId, socket, myStream]);

    useEffect(() => {
        const handleIceCandidate = (event) => {
            if (event.candidate && remoteEmailId) {
                socket.emit('ice-candidate', { emailId: remoteEmailId, candidate: event.candidate });
            }
        };
        peer.addEventListener('icecandidate', handleIceCandidate);
        return () => peer.removeEventListener('icecandidate', handleIceCandidate);
    }, [peer, remoteEmailId, socket]);

    useEffect(() => {
        const handleIncomingIce = ({ candidate }) => {
            if (candidate) peer.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.error);
        };
        const handleRemoteEndCall = () => {
            if (myStream) myStream.getTracks().forEach(track => track.stop());
            window.location.href = '/message';
        };

        socket.on('user-joined', handleNewUserJoined);
        socket.on('incoming-call', handleIncomingCall);
        socket.on('call-accepted', handleCallAccepted);
        socket.on('ice-candidate', handleIncomingIce);
        socket.on('end-call', handleRemoteEndCall);

        return () => {
            socket.off('user-joined', handleNewUserJoined);
            socket.off('incoming-call', handleIncomingCall);
            socket.off('call-accepted', handleCallAccepted);
            socket.off('ice-candidate', handleIncomingIce);
            socket.off('end-call', handleRemoteEndCall);
        }
    }, [handleNewUserJoined, handleIncomingCall, handleCallAccepted, socket, peer, myStream]);

    useEffect(() => {
        getUserMediaStream();
    }, [getUserMediaStream]);

    return (
        <div className="flex flex-col h-screen bg-black text-white">
            {/* Header */}
            <div className="h-[65px] border-b border-[#262626] flex items-center px-6 gap-3 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-[#3797F0]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
                <span className="font-semibold text-base">Video Call</span>
                {remoteEmailId && (
                    <span className="ml-auto text-sm text-[#A8A8A8]">
                        Connected to <span className="text-white font-medium">{remoteEmailId}</span>
                    </span>
                )}
            </div>

            {/* Video Grid */}
            <div className="flex-1 flex flex-col md:flex-row gap-4 p-6 overflow-hidden">
                {/* My Stream */}
                <div className="flex-1 relative rounded-xl overflow-hidden bg-[#121212] border border-[#262626] flex items-center justify-center">
                    {myStream ? (
                        <VideoPlayer stream={myStream} muted={true} />
                    ) : (
                        <div className="flex flex-col items-center gap-3 text-[#A8A8A8]">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                            </svg>
                            <span className="text-sm">Loading camera...</span>
                        </div>
                    )}
                    <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
                        You
                    </div>
                </div>

                {/* Remote Stream */}
                <div className="flex-1 relative rounded-xl overflow-hidden bg-[#121212] border border-[#262626] flex items-center justify-center">
                    {remoteStream ? (
                        <VideoPlayer stream={remoteStream} muted={false} />
                    ) : (
                        <div className="flex flex-col items-center gap-3 text-[#A8A8A8]">
                            <div className="w-20 h-20 rounded-full border-2 border-[#363636] flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-10 h-10">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                </svg>
                            </div>
                            <span className="text-sm">Waiting for the other person to join...</span>
                        </div>
                    )}
                    {remoteEmailId && (
                        <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
                            {remoteEmailId}
                        </div>
                    )}
                </div>
            </div>

            {/* Controls Bar */}
            <div className="h-[80px] border-t border-[#262626] flex items-center justify-center gap-4 shrink-0">
                {!remoteStream && myStream && (
                    <button
                        onClick={() => sendStream(myStream)}
                        className="bg-[#3797F0] hover:bg-[#2b86de] text-white font-semibold text-sm px-6 py-2.5 rounded-full transition-colors cursor-pointer"
                    >
                        Send My Video
                    </button>
                )}
                <button
                    onClick={handleEndCall}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold text-sm px-6 py-2.5 rounded-full transition-colors cursor-pointer"
                >
                    End Call
                </button>
            </div>
        </div>
    )
}

export default Room;