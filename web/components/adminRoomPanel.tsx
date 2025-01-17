import React, { useState } from "react";
import { BASE_WEB_URL } from "../lib/constants";

const buttonClass = "border-r-2 inline-block px-6 py-4 dark:bg-black bg-rumbleBgLight dark:border-rumbleNone border-rumbleOutline dark:text-rumbleNone text-rumbleOutline font-medium text-xs uppercase transition duration-150 ease-in-out border-b-2 sm:border-b-0 hover:bg-rumbleSecondary focus:bg-rumbleSecondary "
const buttonDisabled = "border-r-2 inline-block px-6 py-4 dark:bg-black bg-rumbleBgLight dark:border-rumbleNone border-rumbleOutline dark:text-rumbleNone text-rumbleOutline font-medium text-xs uppercase transition duration-150 ease-in-out border-b-2 sm:border-b-0 pointer-events-none opacity-60"

const AdminRoomPanel = ({ roomSlug }: { roomSlug: string }) => {
  const [gameStarted, setGameStarted] = useState(false);

  const autoGame = async () => {
    if (gameStarted) {
      return;
    }
    const { error } = await fetch(`${BASE_WEB_URL}/api/rooms/start?roomSlug=${roomSlug}`, {
      method: 'POST'
    }).then(res => res.json())
    !error && setGameStarted(true);
  }

  return (
    <div className="w-full text-gray-900 border-b-2 dark:border-rumbleNone border-rumbleOutline">
      <button disabled={gameStarted} className={gameStarted ? buttonDisabled : buttonClass} onClick={autoGame}>Start Game</button>
    </div>
  )
}

export default AdminRoomPanel;