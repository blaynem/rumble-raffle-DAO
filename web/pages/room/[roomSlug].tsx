import React, { useState, useEffect } from "react";
import { Tab } from '@headlessui/react';
import { withSessionSsr } from '../../lib/with-session';
import { ActivityLogType, PlayerType, PrizeValuesType, WinnerLogType } from "@rumble-raffle-dao/rumble";
import io from "socket.io-client";
import { SupabaseUserType } from "../api/auth";

const socket = io('http://localhost:3001').connect()

const buttonClass = "inline-block px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
const buttonDisabled = "inline-block px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md focus:outline-none focus:ring-0 transition duration-150 ease-in-out pointer-events-none opacity-60"

const DisplayEntrant = ({ id, name }: PlayerType) => (
  <li className="px-6 py-2 border-b border-gray-200 w-full rounded-t-lg" key={id}>
    <div>Id: {id}</div>
    <div>Name: {name}</div>
  </li>
)

const DisplayPrizes = ({ firstPlace, secondPlace, thirdPlace, kills, altSplit, totalPrize, totalEntrants }: PrizeValuesType & { totalEntrants: number }) => (
  <div className="border-2 border-slate-100 rounded">
    <h3 className="font-medium leading-tight text-xl text-center mt-0 mb-2">Prize Split</h3>
    <ul className="bg-white rounded-lg w-96 text-gray-900">
      <li className="px-6 py-2 border-b border-gray-200 w-full rounded-t-lg">Total Entrants: {totalEntrants} Bird Warriors</li>
      <li className="px-6 py-2 border-b border-gray-200 w-full">Kills: {kills} sFNC</li>
      <li className="px-6 py-2 border-b border-gray-200 w-full">1st: {firstPlace} sFNC</li>
      <li className="px-6 py-2 border-b border-gray-200 w-full">2nd: {secondPlace} sFNC</li>
      <li className="px-6 py-2 border-b border-gray-200 w-full">3rd: {thirdPlace} sFNC</li>
      <li className="px-6 py-2 border-b border-gray-200 w-full">Stakers: {altSplit} sFNC</li>
      <li className="px-6 py-2 w-full rounded-b-lg">Total: {totalPrize} sFNC</li>
    </ul>
  </div>
);

const DisplayActivityLog = (logs: (ActivityLogType | WinnerLogType)) => {
  // If 'winner' is in type, then it's the WinnerLogType
  if ('winner' in logs) {
    return (
      <div>
        <h3>Winner!!</h3>
        <ul className="bg-white rounded-lg border border-gray-200 w-96 text-gray-900">
          <li className="px-6 py-2 border-b border-gray-200 w-full" >Congratulations {logs.winner.name}</li>
          <li className="px-6 py-2 border-b border-gray-200 w-full" >2nd place: {logs.runnerUps[0]?.name}</li>
          <li className="px-6 py-2 w-full rounded-b-lg" >3rd place: {logs.runnerUps[1]?.name}</li>
        </ul>
      </div>
    )
  }
  // If it's not, then it's a normal activity round.
  return (
    <div>
      <h3>Round {logs.roundCounter}</h3>
      <ul className="bg-white rounded-lg border border-gray-200 w-96 text-gray-900">
        {logs.roundActivityLog.map((activity, index) => (
          <li className="px-6 py-2 border-b border-gray-200 w-full" key={`${activity.activityId}-${index}`}>{activity.content}</li>
        ))}
        <li className="px-6 py-2 w-full rounded-b-lg">Players Left: {logs.playersRemainingIds.length}</li>
      </ul>
    </div>
  )
}

export const getServerSideProps = withSessionSsr(async ({ req, query, ...rest }) => {
  const { activeRoom } = await fetch(`http://localhost:3000/api/rooms/${query.roomSlug}`).then(res => res.json())
  const user = req?.session?.user
  return {
    props: {
      activeRoom,
      roomSlug: query.roomSlug,
      ...(user && { user })
    }
  }
})

const RumbleRoom = ({ roomSlug, user, activeRoom, ...rest }: { roomSlug: string, user: SupabaseUserType, activeRoom: boolean }) => {
  // console.log('---RumbleRoom PROPS---', {user, roomSlug, activeRoom});
  // TODO: Redirect them to home if there is no room shown?
  if (!activeRoom) {
    return <>Please check room number.</>
  }
  const [entrants, setEntrants] = useState([] as PlayerType[]);
  const [prizes, setPrizes] = useState({} as PrizeValuesType);
  const [activityLog, setActivityLog] = useState([] as (ActivityLogType | WinnerLogType)[]);

  useEffect(() => {
    // Join a room
    socket.emit("join_room", roomSlug);

    /**
     * update_player_list called:
     * - On initial join of room
     * - Any time a "user"" is converted to a "player"
     */
    socket.on("update_player_list", (data: { allPlayers: PlayerType[]; prizeSplit: PrizeValuesType }) => {
      console.log('---data', data);
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
  }, [roomSlug]);

  const onJoinClick = () => {
    console.log(user);
    if (user) {
      socket.emit("join_game", { playerData: user, roomSlug });
      // todo: remove join game click
    }
  }

  // TODO: Only allow admins to press play
  const autoGame = () => {
    console.log('--start game pressed: test-rumble--');
    socket.emit("start_game", { playerData: user, roomSlug })
  }

  const clearGame = () => {
    console.log('--clear game pressed: test-rumble--');
    socket.emit("clear_game", { playerData: user, roomSlug })
  }

  const alreadyJoined = entrants.findIndex(entrant => entrant.id === user.id) >= 0;

  return (
    <div className="App">
      <div className="flex items-center justify-center p-4">
        <button className={alreadyJoined ? buttonDisabled : buttonClass} onClick={onJoinClick}>Join Game</button>
        <button className={buttonClass} onClick={autoGame}>Start Auto Game</button>
        <button className={buttonClass} onClick={clearGame}>Clear Game State</button>
      </div>
      <h2 className="text-center">Player: <span className="font-bold">{user?.name}</span></h2>
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        <DisplayPrizes {...prizes} totalEntrants={entrants.length} />
        <div>
          <h3 className="font-medium leading-tight text-xl text-center mt-0 mb-2">Entrants</h3>
          <ul className="bg-white rounded-lg border border-gray-200 w-96 text-gray-900">
            {entrants.map(entrant => <DisplayEntrant key={entrant.id} {...entrant} />)}
          </ul>
        </div>
      </div>
      <div>
        <h3 className="font-medium leading-tight text-xl text-center mt-0 mb-2">Activity Log</h3>
        <div className="flex flex-col items-center">
          {activityLog.map(entry => <DisplayActivityLog key={entry.id} {...entry} />)}
        </div>
      </div>
    </div>
  )
}

export default RumbleRoom;