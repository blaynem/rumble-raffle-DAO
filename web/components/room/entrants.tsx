import React from 'react'
import { DiscordPlayer, IronSessionUserData, PickFromPlayers } from '@rumble-raffle-dao/types'
import { ClickToCopyPopper } from '../Popper'

const DisplayEntrant = ({
  entrant,
  user
}: {
  entrant: PickFromPlayers | DiscordPlayer
  user: IronSessionUserData
}) => {
  /**
   * If entrant.id = user.id is true, we use the user.name field to get most up to date value. (Necessary if they change name locally but doesn't get propagated somehow)
   * If false, we pick the name/username from the correct entrant type.
   */
  const text =
    entrant.id === user?.id
      ? user.name
      : (entrant as PickFromPlayers)?.name || (entrant as DiscordPlayer)?.username
  return (
    <li
      className={`mr-6 mb-2 last:mb-0 dark:text-rumbleNone text-rumbleOutline text-base font-normal ${
        entrant.id === user?.id ? 'dark:bg-rumbleNone/20 bg-rumbleTertiary/40' : ''
      }`}
      key={entrant.id}
    >
      <ClickToCopyPopper text={text} popperText={entrant.id} />
    </li>
  )
}

const Entrants = ({
  loading,
  entrants,
  user
}: {
  loading?: boolean
  entrants: (PickFromPlayers | DiscordPlayer)[]
  user: IronSessionUserData
}) => {
  return (
    <div className="mb-8 w-80 py-6 pl-6 border-2 dark:border-rumbleNone border-rumbleOutline">
      <div className="dark:text-rumbleSecondary text-rumblePrimary uppercase text-lg font-medium leading-7 mb-2">
        Entrants
      </div>
      <ul className="max-h-80 overflow-auto scrollbar-thin scrollbar-thumb-rumblePrimary scrollbar-track-rumbleBgLight">
        {entrants.length < 1 ? (
          <li className="mb-0 dark:text-rumbleNone text-rumbleOutline text-base font-normal">
            {loading ? 'Loading..' : 'No entrants yet.'}
          </li>
        ) : (
          entrants.map(entrant => <DisplayEntrant key={entrant.id} entrant={entrant} user={user} />)
        )}
      </ul>
    </div>
  )
}

export default Entrants
