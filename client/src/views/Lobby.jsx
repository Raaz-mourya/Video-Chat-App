import React from 'react'
import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import chatImage from '../assets/video-conference.png';

import {useSocket} from "../context/SocketProvider"

const LobbyScreen = () => {
  const [email, setEmail] = useState('');
  const [room, setRoom] = useState('');

  const socket = useSocket();
  const navigate = useNavigate();



  const handleSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      socket.emit("room:join", { email, room });
    },
    [email, room, socket],
  )

  const handleJoinRoom = useCallback((data) => {
    const { email, room } = data;
    navigate(`/room/${room}`)
  },[navigate])
  
  useEffect(() => {
    socket.on("room:join", handleJoinRoom);
    return () => {
      socket.off('room:join', handleJoinRoom)
    }
    }, [socket])

  return (
    <div className='container flex flex-col m-auto'>
      <h1 className='text-gray-100 m-8 text-2xl font-bold tracking-wider'>
        Video Call Through <u>Web RTC</u> & <u>Socket.io</u> Website
      </h1>

      <main className='flex flex-col lg:flex-row justify-evenly mt-8'>
        <div className='left-side lg:w-1/2 w-full'>
          <h1 className='text-2xl'>
            <span className='text-yellow-200 font-bold'>Free</span> Video Call
          </h1>
          <h1 className='text-2xl'>
            <span className='text-yellow-200 font-bold'>Secure</span> Video Call
          </h1>
          <h1 className='text-2xl'>
            <span className='text-yellow-200 font-bold'>Reliable</span> Video
            Call
          </h1>
          <h1 className='text-2xl'>
            <span className='text-yellow-200 font-bold'>Fluent</span> Video Call
          </h1>
          <div className='imgBox'>
            <img src={chatImage} alt='img' />
          </div>
        </div>

        <div className='right-side lg:w-1/2 w-full p-8'>
          <h1 className='text-2xl text-yellow-200 font-bold mb-12'>
            Connect With Friends
          </h1>
          <form
            className='container flex flex-col m-auto gap-2'
            onSubmit={handleSubmitForm}
          >
            <div className='m-2 flex justify-center'>
              <label htmlFor='email' className='text-xl font-bold w-1/2'>
                Email id
              </label>
              <input
                className='input-box'
                type='email'
                id='email'
                value={email}
                placeholder='Enter your email...'
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className='m-2 flex justify-center'>
              <label htmlFor='room' className='text-xl font-bold w-1/2'>
                Room Number
              </label>
              <input
                className='input-box'
                type='text'
                id='room'
                value={room}
                placeholder='Enter Friend room no...'
                onChange={(e) => setRoom(e.target.value)}
              />
            </div>

            <div>
              <button className='btn '>Join</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default LobbyScreen;
