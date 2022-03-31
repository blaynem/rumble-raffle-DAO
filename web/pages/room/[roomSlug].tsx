import React, { useState, useEffect } from "react";
import { withSessionSsr } from '../../lib/with-session';
import { EntireGameLog, PlayerAndPrizeSplitType } from "@rumble-raffle-dao/types";
import { GAME_START_COUNTDOWN, JOIN_GAME, JOIN_GAME_ERROR, JOIN_ROOM, NEXT_ROUND_START_COUNTDOWN, UPDATE_ACTIVITY_LOG_ROUND, UPDATE_ACTIVITY_LOG_WINNER, UPDATE_PLAYER_LIST } from "@rumble-raffle-dao/types/constants";
import io from "socket.io-client";
import AdminRoomPanel from "../../components/adminRoomPanel";
import DisplayPrizes from "../../components/room/prizes";
import DisplayActivityLog from "../../components/room/activityLog";
import DisplayEntrant from "../../components/room/entrants";
import { useWallet } from '../../containers/wallet'
import { ClickToCopyPopper } from "../../components/Popper";
import { BASE_API_URL, BASE_WEB_URL } from "../../lib/constants";

const socket = io(BASE_API_URL).connect()

const buttonClass = "inline-block px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
const buttonDisabled = "inline-block px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md focus:outline-none focus:ring-0 transition duration-150 ease-in-out pointer-events-none opacity-60"

export type ServerSidePropsType = {
  activeRoom: boolean;
  roomCreator: string;
  roomSlug: string;
}

export const getServerSideProps = withSessionSsr(async ({ req, query, ...rest }): Promise<{ props: ServerSidePropsType }> => {
  const { data } = await fetch(`${BASE_WEB_URL}/api/rooms/${query.roomSlug}`).then(res => res.json())
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
  const [activityLogRounds, setActivityLogRounds] = useState([] as EntireGameLog['rounds']);
  const [activityLogWinners, setActivityLogWinners] = useState([] as EntireGameLog['winners']);
  const [errorMessage, setErrorMessage] = useState(null);
  const [timeToGameStart, setTimeToGameStart] = useState(null);
  const [timeToNextRoundStart, setTimeToNextRoundStart] = useState(null);

  let gameStartInterval: NodeJS.Timer;
  let nextRoundInterval: NodeJS.Timer;
  // console.log('------RumbleRoom', { entrants, prizes, activityLogRounds, activityLogWinners, user, roomInfo });

  // Countdown for the GAME to start
  useEffect(() => {
    socket.on(GAME_START_COUNTDOWN, (timeToStart: number) => {
      console.log('---GAME_START_COUNTDOWN', timeToStart);
      // Basic countdown until game starts
      setTimeToGameStart(timeToStart)
      let timeElapsed = 0;
      gameStartInterval = setInterval(() => {
        if (timeElapsed >= timeToStart) {
          setTimeToGameStart(null);
          clearInterval(gameStartInterval);
          return;
        }
        timeElapsed += 1;
        setTimeToGameStart(timeToStart - timeElapsed);
      }, 1000)
    })
  }, [])

  // Countdown for the NEXT ROUND to start
  useEffect(() => {
    socket.on(NEXT_ROUND_START_COUNTDOWN, (timeToStart: number) => {
      console.log('---NEXT_ROUND_START_COUNTDOWN', timeToStart);
      // clear game start time
      setTimeToGameStart(null)
      clearInterval(gameStartInterval);
      // Basic countdown until next round starts
      setTimeToNextRoundStart(timeToStart)
      let timeElapsed = 0;
      nextRoundInterval = setInterval(() => {
        if (timeElapsed >= timeToStart) {
          setTimeToNextRoundStart(null);
          clearInterval(nextRoundInterval);
          return;
        }
        timeElapsed += 1;
        setTimeToNextRoundStart(timeToStart - timeElapsed);
      }, 1000)
    })
  }, [])

  // Any time the activity log is updated for the round
  useEffect(() => {
    socket.on(UPDATE_ACTIVITY_LOG_ROUND, (activityLog: EntireGameLog['rounds']) => {
      console.log('---UPDATE_ACTIVITY_LOG_ROUND');
      setActivityLogRounds(activityLog);
      // clear game start time
      setTimeToGameStart(null)
      clearInterval(gameStartInterval);
      // clear next round start time
      setTimeToNextRoundStart(null)
      clearInterval(nextRoundInterval);
    })
  }, [])

  // Any time the winners are announced
  useEffect(() => {
    socket.on(UPDATE_ACTIVITY_LOG_WINNER, (activityLog: EntireGameLog['winners']) => {
      console.log('---UPDATE_ACTIVITY_LOG_WINNER');
      setActivityLogWinners(activityLog);
      // clear game start time
      setTimeToGameStart(null)
      clearInterval(gameStartInterval);
      // clear round start time
      setTimeToNextRoundStart(null)
      clearInterval(nextRoundInterval);
    })
  }, [])

  // Any time there are more players added to the list.
  useEffect(() => {
    /**
     * UPDATE_PLAYER_LIST called:
     * - On initial join of room
     * - Any time a "user"" is converted to a "player"
     */
    socket.on(UPDATE_PLAYER_LIST, (data: PlayerAndPrizeSplitType) => {
      console.log('---UPDATE_PLAYER_LIST');
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

  // Any time a user joins or is disconnected
  useEffect(() => {
    socket.on('disconnect', (s) => {
      console.log('DISCONNECTED');
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
      const { paid, error } = await payEntryFee(roomInfo.contract, roomInfo.params.entry_fee.toString());
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
      <div>
        {timeToGameStart && <div>Game starts in: {timeToGameStart}</div>}
        {timeToNextRoundStart && <div>Next round begins in: {timeToNextRoundStart}</div>}
      </div>
      {errorMessage && <p className="text-center text-red-600">{errorMessage}</p>}
      <div className="flex justify-around">
        <DisplayPrizes {...prizes} entryFee={roomInfo.params?.entry_fee} entryToken={roomInfo.contract?.symbol} totalEntrants={entrants.length} />
        <div>
          <h3 className="font-medium leading-tight text-xl text-center mt-0 mb-2">Entrants</h3>
          <ul className="bg-white rounded-lg border border-gray-200 w-96 text-gray-900 min-w-[440px] max-h-80 overflow-auto">
            {entrants.map(entrant => <DisplayEntrant key={entrant.public_address} entrant={entrant} user={user} />)}
          </ul>
        </div>
      </div>
      <div>
        <h3 className="font-medium leading-tight text-xl text-center mt-0 mb-2">Activity Log</h3>
        <div className="flex flex-col items-center max-h-96 overflow-auto">
          {activityLogRounds?.map((entry, i) => <DisplayActivityLog key={`${entry.round_counter}-${i}`} logs={entry} user={user} />)}
          {activityLogWinners.length > 0 && <div>
            <h3>Winner!!</h3>
            <ul className="bg-white rounded-lg border border-gray-200 w-96 text-gray-900">
              <li className={`px-6 py-2 border-b border-gray-200 w-full ${activityLogWinners[0].public_address === user.public_address ? 'bg-slate-200' : 'bg-white'}`} >
                Congratulations <ClickToCopyPopper boldText text={activityLogWinners[0].name} popperText={activityLogWinners[0].public_address} />
              </li>
              <li className={`px-6 py-2 border-b border-gray-200 w-full ${activityLogWinners[1].public_address === user.public_address ? 'bg-slate-200' : 'bg-white'}`} >
                2nd place: <ClickToCopyPopper boldText text={activityLogWinners[1].name} popperText={activityLogWinners[1].public_address} />
              </li>
              <li className={`px-6 py-2 w-full rounded-b-lg ${activityLogWinners[2].public_address === user.public_address ? 'bg-slate-200' : 'bg-white'}`} >
                3rd place: <ClickToCopyPopper boldText text={activityLogWinners[2].name} popperText={activityLogWinners[2].public_address} />
              </li>
            </ul>
          </div>}
        </div>
      </div>
    </div>
  )
}

export default RumbleRoom;