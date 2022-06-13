import React, { Fragment } from 'react';
import LocalHospitalOutlined from '@mui/icons-material/LocalHospitalOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import Swords from 'tabler-icons-react/dist/icons/swords';
import 'react-popper-tooltip/dist/styles.css';
import { PickFromPlayers, RoundActivityLog, SingleActivity } from "@rumble-raffle-dao/types";
import { ClickToCopyPopper } from '../Popper';
import { Prisma } from '../../../node_modules/.prisma/client';
import HikingOutlined from '@mui/icons-material/HikingOutlined';
import { Decimal } from 'decimal.js';

const iconClass = 'h-5 w-5 dark:stroke-rumbleNone block'
const iconClassMui = 'h-5 w-5 dark:fill-rumbleNone fill-rumbleOutline block'

const replaceActivityDescPlaceholders = (activity: SingleActivity): (string | JSX.Element)[] => {
  const matchPlayerNumber = /(PLAYER_\d+)/ // matches PLAYER_0, PLAYER_12, etc
  const parts = activity.description.split(matchPlayerNumber);

  const replaceNames = parts.map((part, i) => {
    if (part.match(matchPlayerNumber)) {
      const index = Number(part.replace('PLAYER_', ''))
      // Gets the name of the player.
      const player = activity.participants[index]
      return <ClickToCopyPopper key={i} boldText text={player.name} popperText={player.id} />
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
      {icon}
    </span>
    <span className={`p-2 font-light dark:text-rumbleNone ${highlight ? 'dark:bg-rumbleNone/20 bg-rumbleTertiary/40' : ''}`}>{description}</span>
  </li>
)

const getActivityIcon = (activity: SingleActivity) => {
  const { environment } = activity
  if (environment === 'REVIVE') {
    return <LocalHospitalOutlined className={iconClassMui} />;
  }
  if (environment === 'PVE') {
    return <HikingOutlined className={iconClassMui} />;
  }
  return <Swords className={iconClass} />;
}

const DisplayActivity = ({ activity, containsUser }: { activity: SingleActivity; containsUser: boolean; }) => {
  return <ActivityListItem icon={getActivityIcon(activity)} highlight={containsUser} description={replaceActivityDescPlaceholders(activity)} />
}


const DisplayRound = ({ logs, publicAddress }: { logs: RoundActivityLog; publicAddress: string; }) => {
  /**
   * Returns true if the play is present in the array
   */
  const containsUser = (participants: PickFromPlayers[]) => participants.findIndex(p => p?.id === publicAddress) > -1;
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

export const DisplayWinners = ({ winners, user }: { winners: PickFromPlayers[]; user: Pick<Prisma.UsersGroupByOutputType, 'id' | 'name' | 'is_admin'> }) => {
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
        {winners.slice(0, 3).map((winner, i) => (
          <Fragment key={winner.id}>
            {i > 0 && <ActivityBreak />}
            <ActivityListItem
              icon={<EmojiEventsOutlinedIcon className={iconClassMui} />}
              description={[placementMessage[i], ' ', <ClickToCopyPopper key={winner.id} boldText text={winner.name} popperText={winner.id} />, '.']}
              highlight={winner.id === user?.id}
            />
          </Fragment>
        )
        )}
      </ul>
    </div>
  )
}

export const DisplayActivityLogs = ({ allActivities, user }: { allActivities: RoundActivityLog[]; user: Pick<Prisma.UsersGroupByOutputType, 'id' | 'name' | 'is_admin'>; }) => {
  return <>
    {allActivities.map((logs, i) => <DisplayRound key={`${logs.round_counter}-${i}`} logs={logs} publicAddress={user?.id} />)}
  </>
}

const DisplayEntrantKills = ({ count, entrant: { id, name }, user }: { count: number; entrant: PickFromPlayers; user: Pick<Prisma.UsersGroupByOutputType, 'id' | 'name' | 'is_admin'> }) => (
  <li className={`mr-6 mb-2 last:mb-0 dark:text-rumbleNone text-rumbleOutline text-base font-normal ${id === user?.id ? 'dark:bg-rumbleNone/20 bg-rumbleTertiary/40' : ''}`}>
    <div className='flex justify-between'>
      <ClickToCopyPopper text={name} popperText={id} truncate />
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
      Object.keys(activity.kill_count).forEach(id => {
        // These come through as strings for some reason. So we safely convert them to a number.
        const killCountNumber = new Decimal(activity.kill_count[id] as any).toNumber();
        if (killCounts[id]) {
          killCounts[id] += killCountNumber
        } else {
          killCountNumber > 0 && (killCounts[id] = killCountNumber);
        }
      })
    })
  })

  const killCountArr = Object.keys(killCounts)
    .map(id => ({ id, count: killCounts[id] }))
    .sort((a, b) => b.count - a.count);

  return killCountArr;
}

export const DisplayKillCount = ({ entrants, rounds, user }: { entrants: PickFromPlayers[]; rounds: RoundActivityLog[]; user: Pick<Prisma.UsersGroupByOutputType, 'id' | 'name' | 'is_admin'>; }) => {
  return (
    <div className="mb-8 w-80 py-6 pl-6 border-2 dark:border-rumbleNone border-rumbleOutline">
      <div className="dark:text-rumbleSecondary text-rumblePrimary uppercase text-lg font-medium leading-7 mb-2">Kill Count</div>
      <ul className="max-h-80 overflow-auto scrollbar-thin scrollbar-thumb-rumblePrimary scrollbar-track-rumbleBgLight">
        {
          rounds.length < 1 ?
            <li className="mb-0 dark:text-rumbleNone text-rumbleOutline text-base font-normal">No kills yet.</li>
            :
            calcKillCounts(rounds).map(player => {
              const entrant = entrants.find(e => e.id === player.id)
              return <DisplayEntrantKills key={player?.id} count={player.count} entrant={entrant} user={user} />
            })
        }
      </ul>
    </div>
  )
}