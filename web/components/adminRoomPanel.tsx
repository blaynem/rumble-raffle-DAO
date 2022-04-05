import { CLEAR_GAME, START_GAME } from "@rumble-raffle-dao/types/constants";
import React, { useState } from "react";
import { useWallet } from '../containers/wallet'
import { bulkAddPlayer, deleteSeededData } from "../lib/seedDB";

const buttonClass = "inline-block px-6 py-4 dark:bg-black bg-rumbleBgLight dark:border-rumbleNone border-rumbleOutline dark:text-rumbleNone text-rumbleOutline font-medium text-xs uppercase transition duration-150 ease-in-out border-b-2 sm:border-b-0 border-r-2 hover:bg-rumbleSecondary focus:bg-rumbleSecondary "
const buttonDisabled = "inline-block px-6 py-4 dark:bg-black bg-rumbleBgLight dark:border-rumbleNone border-rumbleOutline dark:text-rumbleNone text-rumbleOutline font-medium text-xs uppercase transition duration-150 ease-in-out border-b-2 sm:border-b-0 border-r-2 pointer-events-none opacity-60"

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

  const seedDb = () => {
    clearGame();
    bulkAddPlayer();
  }

  const deleteSeededDB = () => {
    clearGame();
    deleteSeededData();
  }

  return (
    <div className="w-full text-gray-900 border-b-2 dark:border-rumbleNone border-rumbleOutline">
      <button disabled={gameStarted} className={gameStarted ? buttonDisabled : buttonClass} onClick={autoGame}>Start Auto Game</button>
      <button className={buttonClass} onClick={clearGame}>Clear Game State</button>
      <button className={buttonClass} onClick={seedDb}>Seed DB</button>
      <button className={buttonClass} onClick={deleteSeededDB}>Delete Seeded Data</button>
    </div>
  )
}

export default AdminRoomPanel;