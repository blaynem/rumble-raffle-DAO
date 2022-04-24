import React, { Fragment } from 'react';
import LocalDiningOutlinedIcon from '@mui/icons-material/LocalDiningOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
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

const ActivityBreak = () => (<li className='ml-4 h-4 border-l-2 dark:border-l-rumbleNone/40 border-l-black'></li>)

/**
 * Split this off so we can reuse it for the winners.
 * @returns 
 */
const ActivityListItem = ({ description, highlight, icon }: { icon: any; description: (string | JSX.Element)[]; highlight: boolean; }) => (
  <li className='ml-2 flex text-lg relative'>
    <span className="self-center pr-4">
      {React.createElement(icon, { className: 'h-5 w-5 dark:fill-rumbleNone fill-rumbleOutline block' })}
    </span>
    <span className={`p-2 font-light dark:text-rumbleNone ${highlight ? 'dark:bg-rumbleNone/20 bg-rumbleTertiary/40' : ''}`}>{description}</span>
  </li>
)


const DisplayActivity = ({ activity, containsUser }: { activity: SingleActivity; containsUser: boolean; }) => {
  return <ActivityListItem icon={LocalDiningOutlinedIcon} highlight={containsUser} description={replaceActivityDescPlaceholders(activity)} />
}


const DisplayRound = ({ logs, publicAddress }: { logs: RoundActivityLog; publicAddress: string; }) => {
  /**
   * Returns true if the play is present in the array
   */
  const containsUser = (participants: PickFromPlayers[]) => participants.findIndex(p => p?.public_address === publicAddress) > -1;
  return (
    <div key={logs.round_counter} className='w-full'>
      <h3 className='ml-4 border-l-2 dark:border-l-rumbleNone/40 border-l-black text-lg dark:text-rumbleSecondary text-rumblePrimary uppercase font-medium py-2 px-9'>
        Round {logs.round_counter + 1}
      </h3>
      <ul>
        {logs.activities?.map((activity, index) => (
          <Fragment key={`${activity.id}-${index}`}>
            <DisplayActivity activity={activity} containsUser={containsUser(activity.participants)} />
            <ActivityBreak />
          </Fragment>
        ))}
        <li className="ml-4 border-l-2 dark:border-l-rumbleNone/40 border-l-black pt-2 pb-8 px-9 lowercase text-base dark:text-rumbleNone/60 text-rumbleOutline/60">
          {logs.players_remaining} {logs.players_remaining > 1 ? 'players' : 'player'} left
        </li>
      </ul>
    </div>
  )
}

export const DisplayWinners = ({ winners, user }: { winners: PickFromPlayers[]; user: SupabaseUserType }) => {
  const placementMessage = [
    'Congratulations! 1st place goes to',
    '2nd place',
    '3rd place'
  ]
  return (
    <div className='w-full pb-8'>
      <h3 className='ml-4 border-l-2 dark:border-l-rumbleNone/40 border-l-black text-lg dark:text-rumbleSecondary text-rumblePrimary uppercase font-medium py-2 px-9'>
        Winner
      </h3>
      <ul>
        {winners.slice(0,3).map((winner, i) => (
          <Fragment key={winner.public_address}>
            {i > 0 && <ActivityBreak />}
            <ActivityListItem
              icon={EmojiEventsOutlinedIcon}
              description={[placementMessage[i], ' ', <ClickToCopyPopper key={winner.public_address} boldText text={winner.name} popperText={winner.public_address} />, '.']}
              highlight={winner.public_address === user?.public_address}
            />
          </Fragment>
        )
        )}
      </ul>
    </div>
  )
}

export const DisplayActivityLogs = ({ allActivities, user }: { allActivities: RoundActivityLog[]; user: SupabaseUserType; }) => {
  return <>
    {allActivities.map((logs, i) => <DisplayRound key={`${logs.round_counter}-${i}`} logs={logs} publicAddress={user?.public_address} />)}
  </>
}

const DisplayEntrantKills = ({ count, entrant: { public_address, name }, user }: { count: number; entrant: PickFromPlayers; user: SupabaseUserType }) => (
  <li className={`mr-6 mb-2 last:mb-0 dark:text-rumbleNone text-rumbleOutline text-base font-normal ${public_address === user?.public_address ? 'dark:bg-rumbleNone/20 bg-rumbleTertiary/40' : ''}`}>
    <div className='flex justify-between'>
      <ClickToCopyPopper text={name} popperText={public_address} truncate/>
      <div>{count}</div>
    </div>
  </li>
)

const calcKillCounts = (rounds: RoundActivityLog[]) => {
  const killCounts: { [id: string]: number } = {}

  rounds.forEach(round => {
    round.activities.forEach(activity => {
      if (activity.kill_count === null) {
        return;
      }
      Object.keys(activity.kill_count).forEach(publicAddress => {
        if (killCounts[publicAddress]) {
          killCounts[publicAddress] += activity.kill_count[publicAddress]
        } else {
          activity.kill_count[publicAddress] > 0 && (killCounts[publicAddress] = activity.kill_count[publicAddress]);
        }
      })
    })
  })

  const killCountArr = Object.keys(killCounts)
    .map(public_address => ({ public_address, count: killCounts[public_address] }))
    .sort((a, b) => b.count - a.count);

  return killCountArr;
}

export const DisplayKillCount = ({ entrants, rounds, user }: { entrants: PickFromPlayers[]; rounds: RoundActivityLog[]; user: SupabaseUserType; }) => {
  return (
    <div className="mb-8 w-80 py-6 pl-6 border-2 dark:border-rumbleNone border-rumbleOutline">
      <div className="dark:text-rumbleSecondary text-rumblePrimary uppercase text-lg font-medium leading-7 mb-2">Kill Count</div>
      <ul className="max-h-80 overflow-auto scrollbar-thin scrollbar-thumb-rumblePrimary scrollbar-track-rumbleBgLight">
        {
          rounds.length < 1 ?
            <li className="mb-0 dark:text-rumbleNone text-rumbleOutline text-base font-normal">No kills yet.</li>
            :
            calcKillCounts(rounds).map(player => {
              const entrant = entrants.find(e => e.public_address === player.public_address)
              return <DisplayEntrantKills key={player?.public_address} count={player.count} entrant={entrant} user={user} />
            })
        }
      </ul>
    </div>
  )
}