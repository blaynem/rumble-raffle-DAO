import React, { useEffect, useState } from "react";
import { withSessionSsr } from '../../lib/with-session';
import { RoomDataType, SupabaseUserType } from "@rumble-raffle-dao/types";
import { DisplayActivityLogs, DisplayKillCount, DisplayWinners } from "../../components/room/activityLog";
import { useWallet } from '../../containers/wallet'
import { BASE_WEB_URL } from "../../lib/constants";
import Entrants from "../../components/room/entrants";
import { usePreferences } from "../../containers/preferences";
import router from "next/router";

export type ServerSidePropsType = {
  user: SupabaseUserType;
  roomData: RoomDataType;
  error: any;
}

export const getServerSideProps = withSessionSsr(async ({ req, query }): Promise<{ props: ServerSidePropsType }> => {
  const { user } = req.session
  const { data, error } = await fetch(`${BASE_WEB_URL}/api/rooms/${query.roomSlug}`).then(res => res.json())
  return {
    props: {
      user: user || null,
      roomData: data.length > 0 ? data[0] : null,
      error
    }
  }
})

const RumbleRoom = ({ roomData, error }: ServerSidePropsType) => {
  const { user } = useWallet()
  const { preferences } = usePreferences();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setDarkMode(preferences?.darkMode);
  }, [preferences?.darkMode]);

  useEffect(() => {
    // If the game hasn't been completed, push them there.
    if (!roomData.game_completed) {
      router.push(`/room/${roomData.slug}`);
      return;
    }
  })

  if (error || !roomData.game_completed) {
    return (
      <div className={`${darkMode ? 'dark' : 'light'}`} >
        <div className="flex justify-center dark:bg-rumbleOutline bg-rumbleBgLight" style={{ height: 'calc(100vh - 58px)' }}>
          <div className="w-fit pt-20">
            <p className="text-lg dark:text-rumbleSecondary text-rumblePrimary">Oops...</p>
            <h2 className="text-xl dark:text-rumbleNone text-rumbleOutline">{error}</h2>
          </div>
        </div>
      </div >
    )
  }

  return (
    <div className={`${darkMode ? 'dark' : 'light'}`}>
      <div className="dark:bg-black bg-rumbleBgLight overflow-auto sm:overflow-hidden" style={{ height: 'calc(100vh - 58px)' }}>
        <h2 className="dark:border-rumbleBgLight border-black text-center p-4 text-xl uppercase dark:bg-rumbleSecondary bg-rumblePrimary dark:text-black text-rumbleNone border-b-2">Viewing a past game</h2>
        <div className="flex flex-col md:flex-row sm:flex-row">
          {/* Left Side */}
          <div className="ml-6 lg:ml-20 md:ml-6 sm:ml-6 pr-6 mr-2 pt-10 overflow-auto scrollbar-thin dark:scrollbar-thumb-rumbleSecondary scrollbar-thumb-rumblePrimary scrollbar-track-rumbleBgDark" style={{ height: 'calc(100vh - 110px)' }}>
            <Entrants entrants={roomData.players} user={user} />
            <DisplayKillCount entrants={roomData.players} rounds={roomData.gameData.rounds} user={user} />
          </div>
          {/* Right Side */}
          <div className="pr-6 lg:pr-20 md:pr-6 sm:pr-6 py-2 flex-1 overflow-auto scrollbar-thin dark:scrollbar-thumb-rumbleSecondary scrollbar-thumb-rumblePrimary scrollbar-track-rumbleBgDark" style={{ height: 'calc(100vh - 110px)' }}>
            <div className="my-4 h-6 text-center dark:text-rumbleNone text-rumbleOutline" />
            <div className="flex flex-col items-center max-h-full">
              <DisplayActivityLogs allActivities={roomData.gameData.rounds} user={user} />
              <DisplayWinners winners={roomData.gameData.winners} user={user} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RumbleRoom;