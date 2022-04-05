import React from 'react';
import { PickFromPlayers, SupabaseUserType } from "@rumble-raffle-dao/types";
import { ClickToCopyPopper } from '../Popper';

const DisplayEntrant = ({ entrant: { public_address, name }, user }: { entrant: PickFromPlayers; user: SupabaseUserType }) => (
  <li className={`mr-6 mb-2 last:mb-0 dark:text-rumbleNone text-rumbleOutline text-base font-normal ${public_address === user?.public_address ? 'dark:bg-rumbleNone/20 bg-rumbleTertiary/40' : ''}`} key={public_address}>
    <ClickToCopyPopper text={name} popperText={public_address} />
  </li>
)

const Entrants = ({ entrants, user }: any) => {
  return (
    <div className="mb-8 w-80 py-6 pl-6 border-2 dark:border-rumbleNone border-rumbleOutline">
      <div className="dark:text-rumbleSecondary text-rumblePrimary uppercase text-lg font-medium leading-7 mb-2">Entrants</div>
      <ul className="max-h-80 overflow-auto scrollbar-thin scrollbar-thumb-rumblePrimary scrollbar-track-rumbleBgLight">
        {
          entrants.length < 1 ?
          <li className="mb-0 dark:text-rumbleNone text-rumbleOutline text-base font-normal">No entrants yet.</li>
          :
          entrants.map(entrant => <DisplayEntrant key={entrant.public_address} entrant={entrant} user={user} />)
        }
      </ul>
    </div>
  )
}

export default Entrants;