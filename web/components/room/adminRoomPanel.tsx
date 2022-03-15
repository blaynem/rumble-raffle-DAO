import React from "react";
import { useWallet } from '../../containers/wallet'

const buttonClass = "inline-block mr-2 px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"

const AdminRoomPanel = ({ socket, roomSlug }) => {
  const { user } = useWallet()
  // TODO: Only allow admins to press play
  const autoGame = () => {
    console.log('--start game pressed: test-rumble--');
    socket.emit("start_game", { playerData: user, roomSlug })
  }

  const clearGame = () => {
    console.log('--clear game pressed: test-rumble--');
    socket.emit("clear_game", { playerData: user, roomSlug })
  }
  return (
    <div className="p-4 border-2 border-slate-100 w-full text-gray-900">
      <h4>Admin Panel</h4>
      <button className={buttonClass} onClick={autoGame}>Start Auto Game</button>
      <button className={buttonClass} onClick={clearGame}>Clear Game State</button>
    </div>
  )
}

export default AdminRoomPanel;