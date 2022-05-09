import React, { useState, useEffect } from "react";
import { withSessionSsr } from '../../lib/with-session';
import { EntireGameLog, PlayerAndRoomInfoType, RoomDataType, SupabaseUserType } from "@rumble-raffle-dao/types";
import { GAME_START_COUNTDOWN, JOIN_GAME, JOIN_GAME_ERROR, JOIN_ROOM, NEXT_ROUND_START_COUNTDOWN, UPDATE_ACTIVITY_LOG_ROUND, UPDATE_ACTIVITY_LOG_WINNER, UPDATE_PLAYER_LIST } from "@rumble-raffle-dao/types/constants";
import io from "socket.io-client";
import AdminRoomPanel from "../../components/adminRoomPanel";
import { DisplayActivityLogs, DisplayKillCount, DisplayWinners } from "../../components/room/activityLog";
import { useWallet } from '../../containers/wallet'
import { BASE_API_URL, BASE_WEB_URL } from "../../lib/constants";
import Entrants from "../../components/room/entrants";
import { usePreferences } from "../../containers/preferences";
import { useRouter } from "next/router";

const socket = io(BASE_API_URL);

const buttonClass = "inline-block mr-4 px-6 py-4 dark:bg-rumbleNone bg-rumbleOutline dark:text-black text-rumbleNone text-xs uppercase transition duration-150 ease-in-out border-r-2 hover:bg-rumbleSecondary focus:bg-rumbleSecondary"
const buttonDisabled = "inline-block mr-4 px-6 py-4 dark:bg-rumbleNone bg-rumbleOutline dark:text-black text-rumbleNone text-xs uppercase transition duration-150 ease-in-out border-r-2 pointer-events-none opacity-60"

export type ServerSidePropsType = {
  activeRoom: boolean;
  game_completed: boolean;
  game_started: boolean;
  roomCreator: string;
  roomSlug: string;
  user: SupabaseUserType;
}

export const getServerSideProps = withSessionSsr(async ({ req, query, ...rest }): Promise<{ props: ServerSidePropsType }> => {
  const { user } = req.session
  const { data }: { data: RoomDataType[] } = await fetch(`${BASE_WEB_URL}/api/rooms/${query.roomSlug}`).then(res => res.json())
  
  const roomData = data[0];
  return {
    props: {
      activeRoom: data.length > 0,
      game_completed: roomData?.game_completed || null,
      game_started: roomData?.game_started || null,
      roomCreator: roomData?.created_by || null,
      roomSlug: query.roomSlug,
      user: user || null,
    }
  }
})

const RumbleRoom = ({ activeRoom, game_completed, game_started, roomCreator, roomSlug, ...rest }: ServerSidePropsType) => {
  const { user, payEntryFee } = useWallet()
  const { preferences } = usePreferences();
  const router = useRouter()
  const [entrants, setEntrants] = useState([] as PlayerAndRoomInfoType['allPlayers']);
  const [roomInfo, setRoomInfo] = useState({} as PlayerAndRoomInfoType['roomInfo']);
  const [activityLogRounds, setActivityLogRounds] = useState([] as EntireGameLog['rounds']);
  const [activityLogWinners, setActivityLogWinners] = useState([] as EntireGameLog['winners']);
  const [errorMessage, setErrorMessage] = useState(null);
  const [timeToGameStart, setTimeToGameStart] = useState(null);
  const [timeToNextRoundStart, setTimeToNextRoundStart] = useState(null);
  const [calcHeight, setCalcHeight] = useState('calc(100vh - 58px)');
  const [darkMode, setDarkMode] = useState(false);

  let gameStartInterval: NodeJS.Timer;
  let nextRoundInterval: NodeJS.Timer;
  // console.log('------RumbleRoom', { entrants, prizes, activityLogRounds, activityLogWinners, user, roomInfo });

  const isRoomCreator = roomCreator === user?.public_address;

  useEffect(() => {
    setDarkMode(preferences?.darkMode);
  }, [preferences?.darkMode]);

  useEffect(() => {
    if (game_completed) {
      router.push(`/completed/${roomSlug}`);
      return;
    }
    // If this isn't in a useEffect it doesn't always catch in the rerenders.
    setCalcHeight(isRoomCreator ? 'calc(100vh - 108px)' : 'calc(100vh - 58px)');
  }, [])

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
    socket.on(UPDATE_PLAYER_LIST, (data: PlayerAndRoomInfoType) => {
      console.log('---UPDATE_PLAYER_LIST');
      data.allPlayers !== null && setEntrants([...data.allPlayers]);
      data.roomInfo !== null && setRoomInfo(data.roomInfo);
    });
  }, [])

  useEffect(() => {
    socket.on(JOIN_GAME_ERROR, (err) => {
      // if (typeof err === 'string') {
      //   setErrorMessage(err)
      // }
    })
  }, [])

  // Any time a user joins or is disconnected
  useEffect(() => {
    socket.connect();
    socket.on('disconnect', (s) => {
      console.log('DISCONNECTED');
      // Attempts to reconnect.
      if (activeRoom && !game_completed) {
        // Join a room
        socket.emit(JOIN_ROOM, roomSlug);
      }
    })
    if (activeRoom && !game_completed) {
      // Join a room
      socket.emit(JOIN_ROOM, roomSlug);
    }
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
      // There is currently no entry fees
      const { paid, error } = await payEntryFee(roomInfo.contract, '0');
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

  // TODO: Redirect them to home if there is no room shown?
  if (!activeRoom) {
    return (
      <div className={`${darkMode ? 'dark' : 'light'}`} >
        <div className="flex justify-center dark:bg-rumbleOutline bg-rumbleBgLight" style={{ height: 'calc(100vh - 58px)' }}>
          <div className="w-fit pt-20">
            <p className="text-lg dark:text-rumbleSecondary text-rumblePrimary">Oops...</p>
            <h2 className="text-xl dark:text-rumbleNone text-rumbleOutline">Not a valid room number.</h2>
          </div>
        </div>
      </div >
    )
  }

  return (
    <div className={`${darkMode ? 'dark' : 'light'}`}>
      <div className="dark:bg-black bg-rumbleBgLight overflow-auto sm:overflow-hidden" style={{ height: 'calc(100vh - 58px)' }}>
        <div>
          {/* If we don't wrap this, all of the styles break for some reason. I don't even. */}
          {isRoomCreator && <AdminRoomPanel {...{ socket, roomSlug }} />}
        </div>
        <div className="flex flex-col md:flex-row sm:flex-row">
          {/* Left Side */}
          <div className="ml-6 lg:ml-20 md:ml-6 sm:ml-6 pr-6 mr-2 pt-10 overflow-auto scrollbar-thin dark:scrollbar-thumb-rumbleSecondary scrollbar-thumb-rumblePrimary scrollbar-track-rumbleBgDark" style={{ height: calcHeight }}>
            <h2 className="mb-8 dark:text-rumbleNone"><span className="font-bold">{user?.name}</span></h2>
            <div className="mb-8">
              <button className={(!user || alreadyJoined) ? buttonDisabled : buttonClass} onClick={onJoinClick}>{alreadyJoined ? 'Join Game' : 'Join Game'}</button>
              {errorMessage && <p className="mt-4 text-red-600">Error: {errorMessage}</p>}
            </div>
            <Entrants entrants={entrants} user={user} />
            <DisplayKillCount entrants={entrants} rounds={activityLogRounds} user={user} />
          </div>
          {/* Right Side */}
          <div className="pr-6 lg:pr-20 md:pr-6 sm:pr-6 py-2 flex-1 overflow-auto scrollbar-thin dark:scrollbar-thumb-rumbleSecondary scrollbar-thumb-rumblePrimary scrollbar-track-rumbleBgDark" style={{ height: calcHeight }}>
            <div className="my-4 h-6 text-center dark:text-rumbleNone text-rumbleOutline">
              {timeToGameStart && <span>Game starts in: {timeToGameStart}</span>}
              {timeToNextRoundStart && <span>Next round begins in: {timeToNextRoundStart}</span>}
            </div>
            <div className="flex flex-col items-center max-h-full">
              <DisplayActivityLogs allActivities={activityLogRounds} user={user} />
              {activityLogWinners.length > 0 && <DisplayWinners winners={activityLogWinners} user={user} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RumbleRoom;