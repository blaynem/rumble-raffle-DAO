import React from 'react';

const DisplayEntrant = ({ public_address, name }: {public_address: 'string'; name: 'string'}) => (
  <li className="px-6 py-2 border-b border-gray-200 w-full rounded-t-lg" key={public_address}>
    <div>Id: {public_address}</div>
    <div>Name: {name}</div>
  </li>
)


export default DisplayEntrant;