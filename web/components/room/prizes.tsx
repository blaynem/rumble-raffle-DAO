import React from 'react';
import { PrizeValuesType } from '@rumble-raffle-dao/rumble';

const DisplayPrizes = ({ firstPlace, secondPlace, thirdPlace, kills, altSplit, totalPrize, totalEntrants }: PrizeValuesType & { totalEntrants: number }) => (
  <div>
    <h3 className="font-medium leading-tight text-xl text-center mt-0 mb-2">Prize Split</h3>
    <ul className="border-2 border-slate-100 roundedbg-white rounded-lg w-96 text-gray-900">
      <li className="px-6 py-2 border-b border-gray-200 w-full rounded-t-lg">Total Entrants: {totalEntrants} Bird Warriors</li>
      <li className="px-6 py-2 border-b border-gray-200 w-full">Kills: {kills} sFNC</li>
      <li className="px-6 py-2 border-b border-gray-200 w-full">1st: {firstPlace} sFNC</li>
      <li className="px-6 py-2 border-b border-gray-200 w-full">2nd: {secondPlace} sFNC</li>
      <li className="px-6 py-2 border-b border-gray-200 w-full">3rd: {thirdPlace} sFNC</li>
      <li className="px-6 py-2 border-b border-gray-200 w-full">Stakers: {altSplit} sFNC</li>
      <li className="px-6 py-2 w-full rounded-b-lg">Total: {totalPrize} sFNC</li>
    </ul>
  </div>
);

export default DisplayPrizes;