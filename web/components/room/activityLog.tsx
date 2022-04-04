import React from 'react';
import { MenuIcon, XIcon } from '@heroicons/react/outline'
import 'react-popper-tooltip/dist/styles.css';
import { PickFromPlayers, RoundActivityLog, SingleActivity, SupabaseUserType } from "@rumble-raffle-dao/types";
import { ClickToCopyPopper } from '../Popper';

const replaceActivityDescPlaceholders = (activity: SingleActivity): (string | JSX.Element)[] => {
  const matchPlayerNumber = /(PLAYER_\d+)/ // matches PLAYER_0, PLAYER_12, etc
  const parts = activity.description.split(matchPlayerNumber);

  const replaceNames = parts.map((part, i) => {
    if (part.match(matchPlayerNumber)) {
      const index = Number(part.replace('PLAYER_', ''))
      // Gets the name of the player.
      const player = activity.participants[index]
      return <ClickToCopyPopper key={i} boldText text={player.name} popperText={player.public_address} />
    }
    return part;
  })
  return replaceNames
}


const DisplayActivity = ({ activity, containsUser }: { activity: SingleActivity; containsUser: boolean; }) => {
  return (
    <li className='flex mb-4 text-lg relative'>
      <span className="self-center pr-4 stepper-icon">
        <MenuIcon className="h-5 w-5 dark:stroke-rumbleNone stroke-rumbleOutline" />
      </span>
      <span className={`p-2 dark:text-rumbleNone ${containsUser ? 'dark:bg-rumbleNone/20 bg-rumbleTertiary/40' : ''}`}>{replaceActivityDescPlaceholders(activity)}</span>
    </li>
  )
}


const DisplayRound = ({ logs, publicAddress }: { logs: RoundActivityLog; publicAddress: string; }) => {
  /**
   * Returns true if the play is present in the array
   */
  const containsUser = (participants: PickFromPlayers[]) => participants.findIndex(p => p?.public_address === publicAddress) > -1;
  return (
    <div className='w-full'>
      <h3 className='border-l-2 dark:border-l-rumbleNone/40 border-l-black text-lg dark:text-rumbleSecondary text-rumblePrimary uppercase font-medium py-2 px-9'>
        Round {logs.round_counter + 1}
      </h3>
      <ul className="">
        {logs.activities?.map((activity, index) => (
          <DisplayActivity key={`${activity.id}-${index}`} activity={activity} containsUser={containsUser(activity.participants)} />
        ))}
        <li className="relative border-l-2 dark:border-l-rumbleNone/40 border-l-black pt-2 pb-8 px-9 lowercase text-base dark:text-rumbleNone/60 text-rumbleOutline/60">
          {logs.players_remaining} {logs.players_remaining > 1 ? 'players' : 'player'} left
        </li>
      </ul>
    </div>
  )
}

const DisplayActivityLogs = ({ allActivities, user }: { allActivities: RoundActivityLog[]; user: SupabaseUserType; }) => {

  return <>
    {allActivities.map((logs, i) => <DisplayRound key={`${logs.round_counter}-${i}`} logs={logs} publicAddress={user?.public_address} />)}
  </>
}

export default DisplayActivityLogs;