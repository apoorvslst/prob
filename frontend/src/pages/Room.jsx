import React, { useEffect, useCallback, useState } from "react";
import { useSocket } from "../providers/Socket"
import { usePeer } from "../providers/Peer";
import { useParams } from "react-router-dom"
import sendStream from "../providers/Peer";
import ReactPlayer from "react-player";
import remoteStream from "../providers/Peer";



export default Room = () => {
    const socket = useSocket();
    const peer = usePeer();
    const createOffer = usePeer();
    const params = useParams();

    const [myStream, setMyStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [remoteEmailId, setRemoteEmailId] = useState(null);


    const handleNewUserJoined = useCallback(async (data) => {
        const { emailId } = data;
        console.log("new user joined");
        const offer = await createOffer();
        socket.emit("call-user", {
            emailId,
            offer

        })
        setRemoteEmailId(emailId);
    }, [createOffer, socket]);

    const handleIncomingCall = useCallback(async ({ from, offer }) => {
        console.log('incoming call', from, offer);
        const ans = await createAnswer(offer);
        socket.emit('call-accepted', { emailId: from, ans });
        setRemoteEmailId(from);
    }, [createAnswer, socket]);

    const handleCallAccepted = useCallback(async (data) => {
        const { ans } = data;
        console.log("Call got accepted", ans);
        await setRemoteAns(ans);

    }, [])

    const getUserMediaStream = useCallback(() => {
        const stream = navigator.mediaDevices.getUserMedia({ audio: true, video: true });

        setMyStream(stream);
    }, []);

    const handleNegotiation = useCallback(() => {
        const localOffer = peer.localDescription;
        socket.emit('call-user', {
            emailId: remoteEmailId,
            offer: localOffer
        })
    }, [])

    useEffect(() => {
        socket.on('user-joined', handleNewUserJoined);
        socket.on('incoming-call', handleIncomingCall);
        socket.on('call-accepted', handleCallAccepted);
        return () => {
            socket.off('user-joined', handleNewUserJoined);
            socket.off('incoming-call', handleIncomingCall);
            socket.off('call-accepted', handleCallAccepted);
        }
    }, [handleNewUserJoined, socket]);

    useEffect(() => {
        getUserMediaStream();

    }, [getUserMediaStream])

    useEffect(() => {
        peer.addEventListener('negotiationneeded', handleNegotiation);
        return () => {
            peer.removeEventListener('negotiationneeded', handleNegotiation)
        }
    })
    return (
        <div>
            <h1>Room</h1>
            <h2>You are connected to {remoteEmailId}</h2>
            <button onClick={(ev) => sendStream(myStream)}>send my video</button>
            <ReactPlayer url={myStream} playing />
            <ReactPlayer url={remoteStream} playing />

        </div>
    )
}