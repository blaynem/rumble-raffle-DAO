import React from 'react';
import { PickFromPlayers } from "@rumble-raffle-dao/types";
import { ClickToCopyPopper } from '../Popper';
import { Prisma } from '../../../node_modules/.prisma/client';

const DisplayEntrant = ({ entrant: { id, name }, user }: { entrant: PickFromPlayers; user: Pick<Prisma.UsersGroupByOutputType, 'id' | 'name' | 'is_admin'> }) => (
  <li className={`mr-6 mb-2 last:mb-0 dark:text-rumbleNone text-rumbleOutline text-base font-normal ${id === user?.id ? 'dark:bg-rumbleNone/20 bg-rumbleTertiary/40' : ''}`} key={id}>
    <ClickToCopyPopper text={id === user?.id ? user.name : name} popperText={id} />
  </li>
)

const Entrants = ({ loading, entrants, user }: { loading?: boolean; entrants: PickFromPlayers[]; user: Pick<Prisma.UsersGroupByOutputType, 'id' | 'name' | 'is_admin'> }) => {
  return (
    <div className="mb-8 w-80 py-6 pl-6 border-2 dark:border-rumbleNone border-rumbleOutline">
      <div className="dark:text-rumbleSecondary text-rumblePrimary uppercase text-lg font-medium leading-7 mb-2">Entrants</div>
      <ul className="max-h-80 overflow-auto scrollbar-thin scrollbar-thumb-rumblePrimary scrollbar-track-rumbleBgLight">
        {
          entrants.length < 1 ?
            <li className="mb-0 dark:text-rumbleNone text-rumbleOutline text-base font-normal">{loading ? 'Loading..' : 'No entrants yet.'}</li>
            :
            entrants.map(entrant => <DisplayEntrant key={entrant.id} entrant={entrant} user={user} />)
        }
      </ul>
    </div>
  )
}

export default Entrants;