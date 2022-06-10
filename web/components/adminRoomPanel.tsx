import { ServerToClientEvents, ClientToServerEvents } from "@rumble-raffle-dao/types";
import { START_GAME } from "@rumble-raffle-dao/types/constants";
import React, { useState } from "react";
import { Socket } from "socket.io-client";
import { useUser } from '../containers/userHook'

const buttonClass = "inline-block px-6 py-4 dark:bg-black bg-rumbleBgLight dark:border-rumbleNone border-rumbleOutline dark:text-rumbleNone text-rumbleOutline font-medium text-xs uppercase transition duration-150 ease-in-out border-b-2 sm:border-b-0 hover:bg-rumbleSecondary focus:bg-rumbleSecondary "
const buttonDisabled = "inline-block px-6 py-4 dark:bg-black bg-rumbleBgLight dark:border-rumbleNone border-rumbleOutline dark:text-rumbleNone text-rumbleOutline font-medium text-xs uppercase transition duration-150 ease-in-out border-b-2 sm:border-b-0 pointer-events-none opacity-60"

const AdminRoomPanel = ({ socket, roomSlug }: { socket: Socket<ServerToClientEvents, ClientToServerEvents>; roomSlug: string }) => {
  const [gameStarted, setGameStarted] = useState(false);
  const { user } = useUser()

  const autoGame = () => {
    if (gameStarted) {
      return;
    }
    socket.emit(START_GAME, user, roomSlug)
    setGameStarted(true);
  }

  return (
    <div className="w-full text-gray-900 border-b-2 dark:border-rumbleNone border-rumbleOutline">
      <button disabled={gameStarted} className={gameStarted ? buttonDisabled : buttonClass} onClick={autoGame}>Start Auto Game</button>
    </div>
  )
}

export default AdminRoomPanel;