import { RoundActivityLogType, WinnerLogType } from '@rumble-raffle-dao/rumble';
import React from 'react';

const DisplayActivityLog = (logs: (RoundActivityLogType | WinnerLogType)) => {
  // If 'winner' is in type, then it's the WinnerLogType
  if ('winner' in logs) {
    return (
      <div>
        <h3>Winner!!</h3>
        <ul className="bg-white rounded-lg border border-gray-200 w-96 text-gray-900">
          <li className="px-6 py-2 border-b border-gray-200 w-full" >Congratulations {logs.winner.name}</li>
          <li className="px-6 py-2 border-b border-gray-200 w-full" >2nd place: {logs.runnerUps[0]?.name}</li>
          <li className="px-6 py-2 w-full rounded-b-lg" >3rd place: {logs.runnerUps[1]?.name}</li>
        </ul>
      </div>
    )
  }
  // If it's not, then it's a normal activity round.
  return (
    <div>
      <h3>Round {logs.roundCounter}</h3>
      <ul className="bg-white rounded-lg border border-gray-200 w-96 text-gray-900">
        {logs.activityLog.map((activity, index) => (
          <li className="px-6 py-2 border-b border-gray-200 w-full" key={`${activity.activityId}-${index}`}>{activity.content}</li>
        ))}
        <li className="px-6 py-2 w-full rounded-b-lg">Players Left: {logs.playersRemainingIds.length}</li>
      </ul>
    </div>
  )
}

export default DisplayActivityLog;