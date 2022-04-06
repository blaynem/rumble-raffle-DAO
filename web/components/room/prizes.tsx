import React from 'react';
import { PlayerAndPrizeSplitType } from '@rumble-raffle-dao/types';

const DisplayPrizes = ({ entryFee, entryToken, firstPlace, secondPlace, thirdPlace, kills, altSplit, totalEntrants }: Omit<PlayerAndPrizeSplitType['prizeSplit'], 'creatorSplit'> & { entryFee: number; entryToken: string; totalEntrants: number }) => (
  <div className="mb-8 w-80 p-6 border-2 dark:border-rumbleNone border-rumbleOutline">
    <div className="flex justify-between mb-2">
      <div className="dark:text-rumbleSecondary text-rumblePrimary uppercase text-lg font-medium leading-7">Prize Split</div>
      <div className="dark:text-rumbleNone uppercase text-lg font-medium leading-7">{totalEntrants} Battlers</div>
    </div>
    <ul>
      <li className="mb-2 dark:text-rumbleNone text-rumbleOutline text-base font-normal opacity-60">Entry Fee: {entryFee} {entryToken}</li>
      {entryFee > 0 && (
        <>
          <li className="mb-2 dark:text-rumbleNone text-rumbleOutline text-base font-normal opacity-60">Kills: {kills}%</li>
          <li className="mb-2 dark:text-rumbleNone text-rumbleOutline text-base font-normal opacity-60">1st: {firstPlace}%</li>
          <li className="mb-2 dark:text-rumbleNone text-rumbleOutline text-base font-normal opacity-60">2nd: {secondPlace}%</li>
          <li className="mb-2 dark:text-rumbleNone text-rumbleOutline text-base font-normal opacity-60">3rd: {thirdPlace}%</li>
          <li className="mb-0 dark:text-rumbleNone text-rumbleOutline text-base font-normal opacity-60">Alt split: {altSplit}%</li>
        </>
      )}
    </ul>
  </div>
);

export default DisplayPrizes;