import { CLEAR_GAME, START_GAME } from "@rumble-raffle-dao/types/constants";
import React, { useState } from "react";
import { useWallet } from '../../containers/wallet'

const buttonClass = "inline-block mr-2 px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
const buttonDisabled = "inline-block mr-2 px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md focus:outline-none focus:ring-0 transition duration-150 ease-in-out pointer-events-none opacity-60"

const AdminRoomPanel = ({ socket, roomSlug }) => {
  const [gameStarted, setGameStarted] = useState(false);
  const { user } = useWallet()

  const autoGame = () => {
    if (gameStarted) {
      return;
    }
    socket.emit(START_GAME, { playerData: user, roomSlug })
    setGameStarted(true);
  }

  const clearGame = () => {
    socket.emit(CLEAR_GAME, { playerData: user, roomSlug })
    setGameStarted(false);
  }
  return (
    <div className="p-4 border-2 border-slate-100 w-full text-gray-900">
      <h4>Admin Panel</h4>
      <button disabled={gameStarted} className={gameStarted ? buttonDisabled : buttonClass} onClick={autoGame}>Start Auto Game</button>
      <button className={buttonClass} onClick={clearGame}>Clear Game State</button>
    </div>
  )
}

export default AdminRoomPanel;