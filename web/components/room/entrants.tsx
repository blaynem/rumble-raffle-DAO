import React from 'react';
import { PlayerType } from '@rumble-raffle-dao/rumble';

const DisplayEntrant = ({ id, name }: PlayerType) => (
  <li className="px-6 py-2 border-b border-gray-200 w-full rounded-t-lg" key={id}>
    <div>Id: {id}</div>
    <div>Name: {name}</div>
  </li>
)

export default DisplayEntrant;