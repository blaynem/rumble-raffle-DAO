import React from 'react';
import { PickFromPlayers } from "@rumble-raffle-dao/types";

const DisplayEntrant = ({ public_address, name }: PickFromPlayers) => (
  <li className="px-6 py-2 border-b border-gray-200 w-full rounded-t-lg" key={public_address}>
    {/* <div>Id: {public_address}</div> */}
    <div>{name}</div>
  </li>
)


export default DisplayEntrant;