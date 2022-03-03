import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { faker } from "@faker-js/faker";
import { ActivityLogType, PlayerType, PrizeValuesType, WinnerLogType } from "./Rumble";

const socket = io('http://localhost:3001').connect()
// TODO: get this from the browser params
const defaultRoomId = '2';

const fakePlayerToAdd = (): PlayerType => ({
  id: faker.datatype.uuid(),
  name: faker.name.firstName()
});

const DisplayEntrant = ({ id, name }: PlayerType) => (
  <div style={{ border: '1px solid gray', padding: 8, position: 'relative' }} key={id}>
    <div>Id: {id}</div>
    <div>Name: {name}</div>
  </div>
)

const DisplayPrizes = ({ firstPlace, secondPlace, thirdPlace, kills, altSplit, totalPrize, totalEntrants }: PrizeValuesType & { totalEntrants: number }) => (
  <div style={{ border: '1px solid gray', padding: 8 }} >
    <div>Total Entrants: {totalEntrants} Bird Warriors</div>
    <div>Kills: {kills} sFNC</div>
    <div>1st: {firstPlace} sFNC</div>
    <div>2nd: {secondPlace} sFNC</div>
    <div>3rd: {thirdPlace} sFNC</div>
    <div>Stakers: {altSplit} sFNC</div>
    <div>Total: {totalPrize} sFNC</div>
  </div>
);

const DisplayActivityLog = (logs: (ActivityLogType | WinnerLogType)) => {
  // If 'winner' is in type, then it's the WinnerLogType
  if ('winner' in logs) {
    return (
      <div>
        <h3>Winner!!</h3>
        <div>Congratulations {logs.winner.name}</div>
        <div>2nd place: {logs.runnerUps[0]?.name}</div>
        <div>3rd place: {logs.runnerUps[1]?.name}</div>
      </div>
    )
  }
  // If it's not, then it's a normal activity round.
  return (
    <div>
      <h3>Round {logs.roundCounter}</h3>
      {logs.roundActivityLog.map((activity, index) => (<div key={`${activity.activityId}-${index}`}>{activity.content}</div>))}
      <div>Players Left: {logs.playersRemainingIds.length}</div>
    </div>
  )
}


const TestRumble = () => {
  const [playerData, setPlayerData] = useState({} as PlayerType);
  const [roomId, setRoomId] = useState('');
  const [entrants, setEntrants] = useState([] as PlayerType[]);
  const [prizes, setPrizes] = useState({} as PrizeValuesType);
  const [activityLog, setActivityLog] = useState([] as (ActivityLogType | WinnerLogType)[]);

  const onJoinClick = () => {
    const player = fakePlayerToAdd();
    setPlayerData(player);
    if (player.id) {
      socket.emit("join_room", roomId);
      socket.emit("join_game", {playerData: player, roomId});
      // todo: remove join game click
    }
  }

  const autoGame = () => {
    console.log('--start game--');
    socket.emit("start_game", {playerData, roomId})
  }

  const clearGame = () => {
    console.log('--clear game--');
    socket.emit("clear_game", {playerData, roomId})
  }

  useEffect(() => {
    // Join a room
    if (!roomId) {
      setRoomId(defaultRoomId)
      socket.emit("join_room", defaultRoomId);
    } else {
      socket.emit("join_room", roomId);
    }

    //@ts-ignore
    socket.on("update_player_list", (data: {allPlayers: PlayerType[]; prizeSplit: PrizeValuesType}) => {
      //@ts-ignore
      data.allPlayers !== null && setEntrants([...data.allPlayers])
      data.prizeSplit !== null && setPrizes(data.prizeSplit)
    });

    socket.on("update_activity_log", (activityLog: (ActivityLogType | WinnerLogType)[]) => {
      setActivityLog(activityLog);
    })

    // Return function here is used to cleanup the sockets
    return function cleanup() {
      // clean up sockets
    }
  }, [roomId]);

  return (
    <div className="App">
      <div>
        <button onClick={onJoinClick}>Join Game</button>
        <button onClick={autoGame}>Start Auto Game</button>
        <button onClick={clearGame}>Clear Game State</button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        <div style={{ width: 500 }}>
          <h2>Prize Splits</h2>
          <DisplayPrizes {...prizes} totalEntrants={entrants.length} />
          <div>
            <div>Activity Log</div>
            {activityLog.map(entry => <DisplayActivityLog key={entry.id} {...entry} />)}
          </div>
        </div>
        <div style={{ width: 500 }}>
          <h2>Entrants</h2>
          {entrants.map(entrant => <DisplayEntrant key={entrant.id} {...entrant} />)}
        </div>
      </div>
    </div>
  )
}

export default TestRumble;