import React from 'react';

const replaceActivityDescPlaceholders = (activity: any): string => {
  const matchPlayerNumber = /(PLAYER_\d+)/ // matches PLAYER_0, PLAYER_12, etc
  const parts = activity.description.split(matchPlayerNumber);

  const replaceNames = parts.map(part => {
    if (part.match(matchPlayerNumber)) {
      const index = Number(part.replace('PLAYER_', ''))
      // Gets the name of the player.
      return activity.participants[index].name;
    }
    return part;
  }).join('')
  return replaceNames
}

const DisplayActivityLog = (logs: any) => {
  return (
    <div>
      <h3>Round {logs.round_counter + 1}</h3>
      <ul className="bg-white rounded-lg border border-gray-200 w-96 text-gray-900">
        {logs.activities?.map((activity, index) => (
          <li className="px-6 py-2 border-b border-gray-200 w-full" key={`${activity.id}-${index}`}>
            {replaceActivityDescPlaceholders(activity)}
          </li>
        ))}
        <li className="px-6 py-2 w-full rounded-b-lg">Players Left: {logs.players_remaining}</li>
      </ul>
    </div>
  )
}

export default DisplayActivityLog;