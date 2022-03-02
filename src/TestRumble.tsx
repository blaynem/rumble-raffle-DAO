import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io('http://localhost:3001').connect()
const defaultRoom = '1';

const TestRumble = () => {
  const onJoinClick = () => {
    socket.emit("join_room", defaultRoom, (ack: any) => {
      console.log('---ack?', ack);
    });
  }
  return (
    <div style={{width: '100%', border: '1px solid black', padding: 8}}>
      <h2 style={{ textAlign: 'center'}}>Socket Things</h2>
      <div style={{ display:'flex', justifyContent: 'center'}}>
        <button onClick={onJoinClick}>Join</button>
      </div>
    </div>
  )
}

export default TestRumble;