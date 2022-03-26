import React from 'react';
import { PickFromPlayers } from "@rumble-raffle-dao/types";
import { ClickToCopyPopper } from '../Popper';

const DisplayEntrant = ({ public_address, name }: PickFromPlayers) => (
  <li className="px-6 py-2 border-b border-gray-200 w-full rounded-t-lg" key={public_address}>
    <ClickToCopyPopper text={name} popperText={public_address}/>
  </li>
)


export default DisplayEntrant;