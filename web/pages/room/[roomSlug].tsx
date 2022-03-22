import React, { useState, useEffect } from "react";
import { withSessionSsr } from '../../lib/with-session';
import { ActivityLogType, PrizeValuesType, WinnerLogType } from "@rumble-raffle-dao/rumble";
import io from "socket.io-client";
import AdminRoomPanel from "../../components/room/adminRoomPanel";
import DisplayPrizes from "../../components/room/prizes";
import DisplayActivityLog from "../../components/room/activityLog";
import DisplayEntrant from "../../components/room/entrants";
import { useWallet } from '../../containers/wallet'

const socket = io('http://localhost:3001').connect()

const buttonClass = "inline-block px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
const buttonDisabled = "inline-block px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md focus:outline-none focus:ring-0 transition duration-150 ease-in-out pointer-events-none opacity-60"

export const getServerSideProps = withSessionSsr(async ({ req, query, ...rest }) => {
  const { data } = await fetch(`http://localhost:3000/api/rooms/${query.roomSlug}`).then(res => res.json())
  const activeRoom = data?.length > 0;
  return {
    props: {
      activeRoom,
      roomSlug: query.roomSlug,
    }
  }
})

const RumbleRoom = ({ roomSlug, activeRoom, ...rest }: { roomSlug: string, activeRoom: boolean }) => {
  const { user } = useWallet()
  // console.log('---RumbleRoom PROPS---', {user, roomSlug, activeRoom});
  // TODO: Redirect them to home if there is no room shown?
  if (!activeRoom) {
    return <>Please check room number.</>
  }
  const [entrants, setEntrants] = useState([] as {public_address: 'string'; name: 'string'}[]);
  const [prizes, setPrizes] = useState({} as PrizeValuesType);
  const [activityLog, setActivityLog] = useState([] as (ActivityLogType | WinnerLogType)[]);

  console.log({entrants, prizes, activityLog});

  useEffect(() => {
    // Join a room
    socket.emit("join_room", roomSlug);

    /**
     * update_player_list called:
     * - On initial join of room
     * - Any time a "user"" is converted to a "player"
     */
    socket.on("update_player_list", (data: { allPlayers: {public_address: 'string'; name: 'string'}[]; prizeSplit: PrizeValuesType }) => {
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

  const alreadyJoined = entrants.findIndex(entrant => entrant.public_address === user?.public_address) >= 0;

  return (
    <div>
      <AdminRoomPanel {...{socket, roomSlug}} />
      <h2 className="p-2 text-center">Player: <span className="font-bold">{user?.name}</span></h2>
      <div className="flex items-center justify-center p-2">
        <button className={alreadyJoined ? buttonDisabled : buttonClass} onClick={onJoinClick}>Join Game</button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
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
          {activityLog.map(entry => <DisplayActivityLog key={entry.id} {...entry} />)}
        </div>
      </div>
    </div>
  )
}

export default RumbleRoom;