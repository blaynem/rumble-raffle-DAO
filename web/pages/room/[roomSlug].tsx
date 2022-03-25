import React, { useState, useEffect } from "react";
import { withSessionSsr } from '../../lib/with-session';
import { PrizeValuesType } from "@rumble-raffle-dao/rumble";
import { ServerSidePropsType } from "@rumble-raffle-dao/types/web";
import io from "socket.io-client";
import AdminRoomPanel from "../../components/room/adminRoomPanel";
import DisplayPrizes from "../../components/room/prizes";
import DisplayActivityLog from "../../components/room/activityLog";
import DisplayEntrant from "../../components/room/entrants";
import { useWallet } from '../../containers/wallet'

const socket = io('http://localhost:3001').connect()

const buttonClass = "inline-block px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
const buttonDisabled = "inline-block px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md focus:outline-none focus:ring-0 transition duration-150 ease-in-out pointer-events-none opacity-60"

export const getServerSideProps = withSessionSsr(async ({ req, query, ...rest }): Promise<{ props: ServerSidePropsType }> => {
  const { data } = await fetch(`http://localhost:3000/api/rooms/${query.roomSlug}`).then(res => res.json())
  const activeRoom = data?.length > 0;
  const { created_by } = data[0];
  return {
    props: {
      activeRoom,
      roomCreator: created_by,
      roomSlug: query.roomSlug,
    }
  }
})

const RumbleRoom = ({ activeRoom, roomCreator, roomSlug, ...rest }: ServerSidePropsType) => {
  const { user } = useWallet()
  // console.log('---RumbleRoom PROPS---', {user, roomSlug, activeRoom});
  // TODO: Redirect them to home if there is no room shown?
  if (!activeRoom) {
    return <>Please check room number.</>
  }
  const [entrants, setEntrants] = useState([] as { public_address: 'string'; name: 'string' }[]);
  const [prizes, setPrizes] = useState({} as PrizeValuesType);
  const [activityLog, setActivityLog] = useState([] as any);

  console.log('------reee', { entrants, prizes, activityLog });

  useEffect(() => {
    socket.on("update_activity_log", (activityLog: any) => {
      console.log('---emited?', activityLog);
      setActivityLog(activityLog);
    })
  }, [activityLog])

  useEffect(() => {
    /**
     * update_player_list called:
     * - On initial join of room
     * - Any time a "user"" is converted to a "player"
     */
    socket.on("update_player_list", (data: { allPlayers: { public_address: 'string'; name: 'string' }[]; prizeSplit: PrizeValuesType }) => {
      console.log('---data', data);
      data.allPlayers !== null && setEntrants([...data.allPlayers])
      data.prizeSplit !== null && setPrizes(data.prizeSplit)
    });
  })

  useEffect(() => {
    // Join a room
    socket.emit("join_room", roomSlug);
    // Return function here is used to cleanup the sockets
    return function cleanup() {
      // clean up sockets
      socket.disconnect()
    }
  }, [roomSlug]);

  const onJoinClick = () => {
    console.log(user);
    if (user) {
      socket.emit("join_game", { playerData: user, roomSlug });
      // todo: remove join game click
    }
  }

  const alreadyJoined = entrants.findIndex(entrant => entrant.public_address === user?.public_address) >= 0;

  return (
    <div>
      <AdminRoomPanel {...{ socket, roomSlug }} />
      {/* {roomCreator === user?.public_address && <AdminRoomPanel {...{ socket, roomSlug }} />} */}
      <h2 className="p-2 text-center">Player: <span className="font-bold">{user?.name}</span></h2>
      <div className="flex items-center justify-center p-2">
        <button className={alreadyJoined ? buttonDisabled : buttonClass} onClick={onJoinClick}>Join Game</button>
      </div>
      <div className="flex justify-around">
        <DisplayPrizes {...prizes} totalEntrants={entrants.length} />
        <div>
          <h3 className="font-medium leading-tight text-xl text-center mt-0 mb-2">Entrants</h3>
          <ul className="bg-white rounded-lg border border-gray-200 w-96 text-gray-900 min-w-[440px]">
            {entrants.map(entrant => <DisplayEntrant key={entrant.public_address} {...entrant} />)}
          </ul>
        </div>
      </div>
      <div>
        <h3 className="font-medium leading-tight text-xl text-center mt-0 mb-2">Activity Log</h3>
        <div className="flex flex-col items-center">
        {/* {activityLog.rounds?.map(entry => <div>{JSON.stringify(entry)}</div>)} */}
          {activityLog.rounds?.map(entry => <DisplayActivityLog {...entry} />)}
          {activityLog.winners && <div>
            <h3>Winner!!</h3>
            <ul className="bg-white rounded-lg border border-gray-200 w-96 text-gray-900">
              <li className="px-6 py-2 border-b border-gray-200 w-full" >Congratulations {activityLog.winners[0].name}</li>
              <li className="px-6 py-2 border-b border-gray-200 w-full" >2nd place: {activityLog.winners[1].name}</li>
              <li className="px-6 py-2 w-full rounded-b-lg" >3rd place: {activityLog.winners[2].name}</li>
            </ul>
          </div>}
        </div>
      </div>
    </div>
  )
}

export default RumbleRoom;