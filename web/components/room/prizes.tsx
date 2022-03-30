import React from 'react';
import { PlayerAndPrizeSplitType } from '@rumble-raffle-dao/types';

const DisplayPrizes = ({ entryFee, entryToken, firstPlace, secondPlace, thirdPlace, kills, altSplit, totalEntrants }: PlayerAndPrizeSplitType['prizeSplit'] & { entryFee: number; entryToken: string; totalEntrants: number }) => (
  <div>
    <h3 className="font-medium leading-tight text-xl text-center mt-0 mb-2">Prize Split</h3>
    <ul className="border-2 border-slate-100 roundedbg-white rounded-lg w-96 text-gray-900">
      <li className="px-6 py-2 border-b border-gray-200 w-full rounded-t-lg">Total Entrants: {totalEntrants} Battlers</li>
      <li className="px-6 py-2 border-b border-gray-200 w-full">Entry Fee: {entryFee} {entryToken}</li>
      {entryFee > 0 && (
        <>
          <li className="px-6 py-2 border-b border-gray-200 w-full">Kills: {kills}%</li>
          <li className="px-6 py-2 border-b border-gray-200 w-full">1st: {firstPlace}%</li>
          <li className="px-6 py-2 border-b border-gray-200 w-full">2nd: {secondPlace}%</li>
          <li className="px-6 py-2 border-b border-gray-200 w-full">3rd: {thirdPlace}%</li>
          <li className="px-6 py-2 border-b border-gray-200 w-full">Alt Split: {altSplit}%</li>
        </>
      )}
    </ul>
  </div>
);

export default DisplayPrizes;