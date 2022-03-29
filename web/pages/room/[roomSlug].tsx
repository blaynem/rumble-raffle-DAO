import React, { useState, useEffect } from "react";
import { withSessionSsr } from '../../lib/with-session';
import { EntireGameLog, PlayerAndPrizeSplitType } from "@rumble-raffle-dao/types";
import { JOIN_GAME, JOIN_GAME_ERROR, JOIN_ROOM, UPDATE_ACTIVITY_LOG, UPDATE_PLAYER_LIST } from "@rumble-raffle-dao/types/constants";
import io from "socket.io-client";
import AdminRoomPanel from "../../components/adminRoomPanel";
import DisplayPrizes from "../../components/room/prizes";
import DisplayActivityLog from "../../components/room/activityLog";
import DisplayEntrant from "../../components/room/entrants";
import { useWallet } from '../../containers/wallet'
import { ClickToCopyPopper } from "../../components/Popper";

const socket = io('http://localhost:3001').connect()

const buttonClass = "inline-block px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
const buttonDisabled = "inline-block px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md focus:outline-none focus:ring-0 transition duration-150 ease-in-out pointer-events-none opacity-60"

export type ServerSidePropsType = {
  activeRoom: boolean;
  roomCreator: string;
  roomSlug: string;
}

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
  const { user, payEntryFee } = useWallet()
  // console.log('---RumbleRoom PROPS---', {user, roomSlug, activeRoom});
  // TODO: Redirect them to home if there is no room shown?
  if (!activeRoom) {
    return <>Please check room number.</>
  }
  const [entrants, setEntrants] = useState([] as PlayerAndPrizeSplitType['allPlayers']);
  const [prizes, setPrizes] = useState({} as PlayerAndPrizeSplitType['prizeSplit']);
  const [roomInfo, setRoomInfo] = useState({} as PlayerAndPrizeSplitType['roomInfo']);
  const [activityLog, setActivityLog] = useState({} as EntireGameLog);
  const [errorMessage, setErrorMessage] = useState(null);

  console.log('------reee', { entrants, prizes, activityLog, user, roomInfo });

  useEffect(() => {
    socket.on(UPDATE_ACTIVITY_LOG, (activityLog: EntireGameLog) => {
      console.log('---emited?', activityLog);
      setActivityLog(activityLog);
    })
  }, [activityLog])

  useEffect(() => {
    /**
     * UPDATE_PLAYER_LIST called:
     * - On initial join of room
     * - Any time a "user"" is converted to a "player"
     */
    socket.on(UPDATE_PLAYER_LIST, (data: PlayerAndPrizeSplitType) => {
      console.log('---data', data);
      data.allPlayers !== null && setEntrants([...data.allPlayers]);
      data.prizeSplit !== null && setPrizes(data.prizeSplit);
      data.roomInfo !== null && setRoomInfo(data.roomInfo);
    });
  })

  useEffect(() => {
    socket.on(JOIN_GAME_ERROR, (err) => {
      // if (typeof err === 'string') {
      //   setErrorMessage(err)
      // }
    })
  })

  useEffect(() => {
    socket.on('disconnect', (s) => {
      // Attempts to reconnect.
      socket.emit(JOIN_ROOM, roomSlug);
    })
    // Join a room
    socket.emit(JOIN_ROOM, roomSlug);
    // Return function here is used to cleanup the sockets
    return function cleanup() {
      // clean up sockets
      socket.disconnect()
    }
  }, [roomSlug]);

  const onJoinClick = async () => {
    if (user) {
      // Clear error message.
      setErrorMessage(null);
      // Using temp tokenAddress for now
      // const data = await payEntryFee(roomInfo.contract.contract_address, roomInfo.params.entry_fee.toString());
      const tokenAddress = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0';
      const { paid, error } = await payEntryFee(roomInfo.contract, tokenAddress, roomInfo.params.entry_fee.toString());
      console.log('---doThing:data', { paid, error });
      if (error) {
        setErrorMessage(error)
        console.error('Join Click:', error);
        return;
      }
      if (paid) {
        socket.emit(JOIN_GAME, { playerData: user, roomSlug });
      }
      // todo: remove join game click
    }
  }

  const alreadyJoined = entrants.findIndex(entrant => entrant.public_address === user?.public_address) >= 0;

  return (
    <div>
      <div>
        {/* If we don't wrap this, all of the styles break for some reason. I don't even. */}
        {roomCreator === user?.public_address && <AdminRoomPanel {...{ socket, roomSlug }} />}
      </div>
      <h2 className="p-2 text-center">Player: <span className="font-bold">{user?.name}</span></h2>
      <div className="flex items-center justify-center p-2">
        <button className={(alreadyJoined) ? buttonDisabled : buttonClass} onClick={onJoinClick}>{alreadyJoined ? 'Joined' : 'Join Game'}</button>
      </div>
      {errorMessage && <p className="text-center text-red-600">{errorMessage}</p>}
      <div className="flex justify-around">
        <DisplayPrizes {...prizes} entryFee={roomInfo.params?.entry_fee} entryToken={roomInfo.contract?.symbol} totalEntrants={entrants.length} />
        <div>
          <h3 className="font-medium leading-tight text-xl text-center mt-0 mb-2">Entrants</h3>
          <ul className="bg-white rounded-lg border border-gray-200 w-96 text-gray-900 min-w-[440px] max-h-80 overflow-auto">
            {entrants.map(entrant => <DisplayEntrant key={entrant.public_address} {...entrant} />)}
          </ul>
        </div>
      </div>
      <div>
        <h3 className="font-medium leading-tight text-xl text-center mt-0 mb-2">Activity Log</h3>
        <div className="flex flex-col items-center max-h-96 overflow-auto">
          {activityLog.rounds?.map((entry, i) => <DisplayActivityLog key={`${entry.round_counter}-${i}`} {...entry} />)}
          {activityLog.winners && <div>
            <h3>Winner!!</h3>
            <ul className="bg-white rounded-lg border border-gray-200 w-96 text-gray-900">
              <li className="px-6 py-2 border-b border-gray-200 w-full" >Congratulations <ClickToCopyPopper boldText text={activityLog.winners[0].name} popperText={activityLog.winners[0].public_address} /> </li>
              <li className="px-6 py-2 border-b border-gray-200 w-full" >2nd place: <ClickToCopyPopper boldText text={activityLog.winners[1].name} popperText={activityLog.winners[1].public_address} /></li>
              <li className="px-6 py-2 w-full rounded-b-lg" >3rd place: <ClickToCopyPopper boldText text={activityLog.winners[2].name} popperText={activityLog.winners[2].public_address} /></li>
            </ul>
          </div>}
        </div>
      </div>
    </div>
  )
}

export default RumbleRoom;