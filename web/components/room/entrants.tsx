import React from 'react';
import { PlayerType } from '@rumble-raffle-dao/rumble';

const DisplayEntrant = ({ publicAddress, name }: {publicAddress: 'string'; name: 'string'}) => (
  <li className="px-6 py-2 border-b border-gray-200 w-full rounded-t-lg" key={publicAddress}>
    <div>Id: {publicAddress}</div>
    <div>Name: {name}</div>
  </li>
)

export default DisplayEntrant;