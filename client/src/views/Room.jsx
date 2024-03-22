import React, { useEffect, useCallback, useState } from "react";
import ReactPlayer from "react-player";
import peer from "../service/peer";
import { useSocket } from "../context/SocketProvider";

const RoomPage = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, SetMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`Email ${email} joined room`);
    setRemoteSocketId(id);
  }, []);

  
  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });

    SetMyStream(stream);
  }, [remoteSocketId, socket]);

  const handleIncomingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      SetMyStream(stream);

      console.log(`incoming call`, from, offer);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      peer.setLocalDescription(ans);
      console.log("Call Accepted!");
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncoming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ans}) => {
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log("Got Tracks!")
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incoming:call", handleIncomingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncoming);
    socket.on("peer:nego:final", handleNegoNeedFinal);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incoming:call", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncoming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncomingCall,
    handleCallAccepted,
    handleNegoNeedIncoming,
    handleNegoNeedFinal,
  ]);

  return (
    <div className='pt-8'>
      <h1 className='text-6xl font-bold text-gray-100 tracking-wide'>
        Room Page
      </h1>
      <h4 className='text-xl font-bold text-yellow-300 tracking-wide'>
        {remoteSocketId ? "Connected" : "No one in room"}
      </h4>
      {myStream && (
        <button className='btn mt-4 mr-8' onClick={sendStreams}>
          Send Stream
        </button>
      )}
      {remoteSocketId && (
        <button className='btn mt-4' onClick={handleCallUser}>
          CALL
        </button>
      )}
      <div className='main flex flex-col lg:flex-row justify-center item-center mt-8'>
        <div className='left-s w-full lg:w-1/2'>
          {myStream && (
            <>
              <h1 className='text-xl font-bold text-yellow-300 tracking-wide mb-4'>
                My Stream
              </h1>
              <ReactPlayer
                playing
                muted
                height='300px'
                width='500px'
                url={myStream}
              />
            </>
          )}
        </div>

        <div className='right-s'>
          {remoteStream && (
            <>
              <h1 className='text-xl font-bold text-yellow-300 tracking-wide mb-4'>
                Remote Stream
              </h1>
              <ReactPlayer
                playing
                muted
                height='300px'
                width='500px'
                url={remoteStream}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomPage;
