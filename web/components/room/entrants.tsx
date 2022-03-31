import React from 'react';
import { PickFromPlayers, SupabaseUserType } from "@rumble-raffle-dao/types";
import { ClickToCopyPopper } from '../Popper';

const DisplayEntrant = ({ entrant: { public_address, name }, user }: { entrant: PickFromPlayers; user: SupabaseUserType }) => (
  <li className={`px-6 py-2 border-b border-gray-200 w-full rounded-t-lg ${public_address === user.public_address ? 'bg-slate-200' : 'bg-white'}`} key={public_address}>
    <ClickToCopyPopper text={name} popperText={public_address} />
  </li>
)


export default DisplayEntrant;