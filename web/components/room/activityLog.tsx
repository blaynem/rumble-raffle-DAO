import React from 'react';
import { usePopperTooltip } from 'react-popper-tooltip';
import 'react-popper-tooltip/dist/styles.css';
import { RoundActivityLog, SingleActivity } from "@rumble-raffle-dao/types";

const Descriptions = ({name, public_address}) => {
  const {
    getArrowProps,
    getTooltipProps,
    setTooltipRef,
    setTriggerRef,
    visible,
  } = usePopperTooltip();

  return (
    <>
      <span ref={setTriggerRef}>
        {name}
      </span>
      {visible && (
        <div
          ref={setTooltipRef}
          {...getTooltipProps({ className: 'tooltip-container' })}
        >
          {public_address}
          <div {...getArrowProps({ className: 'tooltip-arrow' })} />
        </div>
      )}
    </>
  );
}

const replaceActivityDescPlaceholders = (activity: SingleActivity): (string | JSX.Element)[] => {
  const matchPlayerNumber = /(PLAYER_\d+)/ // matches PLAYER_0, PLAYER_12, etc
  const parts = activity.description.split(matchPlayerNumber);

  const replaceNames = parts.map(part => {
    if (part.match(matchPlayerNumber)) {
      const index = Number(part.replace('PLAYER_', ''))
      // Gets the name of the player.
      const player = activity.participants[index]
      return <Descriptions name={player.name} public_address={player.public_address} />
    }
    return part;
  })
  return replaceNames
}

const DisplayActivityLog = (logs: RoundActivityLog) => {
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