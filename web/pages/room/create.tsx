import { PrizeSplitType } from '@rumble-raffle-dao/rumble';
import React, { useState } from 'react';
import { useWallet } from '../../containers/wallet';

/**
 * Everything needed to create a room
 * 
 * - slug
 * - pve chance
 * - revive chance
 * - prize split - {kills, altSplit, firstPlace, secondPlace, thirdPlace, creatorSplit}
 * - cost of entry
 * - coin network
 * - coin contract
 */

const defaultPrizeSplit: PrizeSplitType = {
  kills: undefined,
  altSplit: undefined,
  firstPlace: undefined,
  secondPlace: undefined,
  thirdPlace: undefined,
  creatorSplit: 1
}

const coinNetworks = [
  {
    rpc: "https://polygon-rpc.com/",
    name: 'Polygon'
  },
  // {
  //   rpc: 'https://mainnet.infura.io/v3/',
  //   name: 'Ethereum'
  // }
]

// Possible coin contracts
const coinContracts = {
  'sFNC': {
    name: 'sFNC',
    contract: "0x8f06208951E202d30769f50FAec22AEeC7621BE2"
  }
}

const PleaseLoginMessage = () => {
  return (
    <div className='p-8 text-center'>
      <h2 className="text-lg leading-6 font-medium text-gray-900">You must login before creating a room.</h2>
    </div>
  )
}

const tempBody = {
  params: {
    pveChance: 30,
    reviveChance: 5,
    prizeSplit: {
      kills: 20,
      altSplit: 9,
      firstPlace: 50,
      secondPlace: 10,
      thirdPlace: 10,
      creatorSplit: 1
    },
    entryFee: 100,
    coinNetwork: "coinNetwork",
    coinContract: "coinContract",
  },
  slug: "test-slug",
  user: {
    publicAddress: "pubAddy",
    id: "77dbd231-f3ca-4c9f-a799-8ab943003129"
  }
}

/**
 * TODO:
 * - Check that a slug isn't taken.
 * - On submit, check for errors and show them on the given fields.
 * - When a contract is selected, we should fetch that info to double check it's the things
 */
const Create = () => {
  const { user } = useWallet()
  if (!user || !user.publicAddress) {
    return <PleaseLoginMessage />
  }
  const [slug, setSlug] = useState("");
  const [pveChance, setPveChance] = useState("");
  const [reviveChance, setReviveChance] = useState("");
  const [prizeSplit, setPrizeSplit] = useState(defaultPrizeSplit as PrizeSplitType);
  const [entryFee, setEntryFee] = useState("");
  const [coinNetwork, setCoinNetwork] = useState(coinNetworks[0].rpc);
  const [coinContract, setCoinContract] = useState(coinContracts.sFNC.contract);

  const handleSetPrizeSplit = (e) => {
    const { name, value } = e.target;
    setPrizeSplit({ ...prizeSplit, [name]: value })
  }

  const handleSubmit = async () => {
    console.log('--pressed');
    const test = await fetch('/api/create', {
      method: 'POST',
      body: JSON.stringify({
        ...tempBody
        // slug, pveChance, reviveChance, prizeSplit, entryFee, coinNetwork, coinContract, user
      })
    }).then(res => res.json())
    console.log('---submit', test);
  }

  return (
    <div className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'>
      <div className="mt-10 sm:mt-0">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <div className="px-4 sm:px-0">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Create A Room</h3>
              <p className="mt-1 text-sm text-gray-600">
                This information will be used to create a rumble room.
              </p>
            </div>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <div className="shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                <h4 className="text-base font-medium text-gray-900">Game Details</h4>
                <div className="grid grid-cols-7 gap-6">
                  {/* SLUG */}
                  <div className="col-span-3 sm:col-span-3">
                    <label htmlFor="desired-slug" className="block text-sm font-medium text-gray-700">
                      Slug
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        /
                      </span>
                      <input
                        type="text"
                        name="desired-slug"
                        id="desired-slug"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300"
                        placeholder="abc123"
                      />
                    </div>
                  </div>
                  {/* PVE CHANCE */}
                  <div className="col-span-2">
                    <label htmlFor="pve-chance" className="block text-sm font-medium text-gray-700">
                      PvE Chance
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="number"
                        name="pve-chance"
                        id="pve-chance"
                        value={pveChance}
                        onChange={(e) => setPveChance(e.target.value)}
                        className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                        placeholder="30"
                      />
                      <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        %
                      </span>
                    </div>
                  </div>
                  {/* REVIVE CHANCE */}
                  <div className="col-span-2">
                    <label htmlFor="revive-chance" className="block text-sm font-medium text-gray-700">
                      Revive Chance
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="number"
                        name="revive-chance"
                        id="revive-chance"
                        value={reviveChance}
                        onChange={(e) => setReviveChance(e.target.value)}
                        className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                        placeholder="5"
                      />
                      <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        %
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                <h4 className="text-base font-medium text-gray-900">Prize Split</h4>
                <div className="grid grid-cols-6 gap-6">
                  {/* KILL COUNT SPLIT */}
                  <div className="col-span-1 xl:col-span-1 sm:col-span-2">
                    <label htmlFor="payout-kill" className="block text-sm font-medium text-gray-700">
                      Kills
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="number"
                        name="kills"
                        id="payout-kill"
                        value={prizeSplit.kills || ''}
                        onChange={(e) => handleSetPrizeSplit(e)}
                        className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                        placeholder="5"
                      />
                      <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        %
                      </span>
                    </div>
                  </div>
                  {/* FIRST PLACE SPLIT */}
                  <div className="col-span-1 xl:col-span-1 sm:col-span-2">
                    <label htmlFor="payout-firstPlace" className="block text-sm font-medium text-gray-700">
                      First Place
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="number"
                        name="firstPlace"
                        id="payout-firstPlace"
                        value={prizeSplit.firstPlace || ''}
                        onChange={(e) => handleSetPrizeSplit(e)}
                        className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                        placeholder="5"
                      />
                      <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        %
                      </span>
                    </div>
                  </div>
                  {/* SECOND PLACE SPLIT */}
                  <div className="col-span-1 xl:col-span-1 sm:col-span-2">
                    <label htmlFor="payout-secondPlace" className="block text-sm font-medium text-gray-700">
                      Second Place
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="number"
                        name="secondPlace"
                        id="payout-secondPlace"
                        value={prizeSplit.secondPlace || ''}
                        onChange={(e) => handleSetPrizeSplit(e)}
                        className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                        placeholder="5"
                      />
                      <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        %
                      </span>
                    </div>
                  </div>
                  {/* THIRD PLACE SPLIT */}
                  <div className="col-span-1 xl:col-span-1 sm:col-span-2">
                    <label htmlFor="payout-thirdPlace" className="block text-sm font-medium text-gray-700">
                      Third Place
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="number"
                        name="thirdPlace"
                        id="payout-thirdPlace"
                        value={prizeSplit.thirdPlace || ''}
                        onChange={(e) => handleSetPrizeSplit(e)}
                        className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                        placeholder="5"
                      />
                      <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        %
                      </span>
                    </div>
                  </div>
                  {/* ALT SPLIT */}
                  <div className="col-span-1 xl:col-span-1 sm:col-span-2">
                    <label htmlFor="payout-alternative" className="block text-sm font-medium text-gray-700">
                      Alternative Split
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="number"
                        name="altSplit"
                        id="payout-alternative"
                        value={prizeSplit.altSplit || ''}
                        onChange={(e) => handleSetPrizeSplit(e)}
                        className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                        placeholder="5"
                      />
                      <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        %
                      </span>
                    </div>
                  </div>
                  {/* RUMBLE RAFFLE SPLIT */}
                  <div className="col-span-1 xl:col-span-1 sm:col-span-2">
                    <label htmlFor="payout-creator" className="block text-sm font-medium text-gray-700">
                      Rumble Raffle
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        disabled
                        type="number"
                        name="creatorSplit"
                        id="payout-creator"
                        defaultValue={prizeSplit.creatorSplit}
                        className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                        placeholder="1"
                      />
                      <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        %
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {/* COIN INFORMATION */}
              <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                <h4 className="text-base font-medium text-gray-900">Payment Information</h4>
                <div className="grid grid-cols-6 gap-6">
                  {/* ENTRY COST */}
                  <div className="col-span-2">
                    <label htmlFor="entry-fee" className="block text-sm font-medium text-gray-700">
                      Entry Fee
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        $
                      </span>
                      <input
                        type="number"
                        name="entry-fee"
                        id="entry-fee"
                        value={entryFee}
                        onChange={e => setEntryFee(e.target.value)}
                        className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300"
                        placeholder="10"
                      />
                    </div>
                  </div>
                  {/* CONTRACT NETWORK */}
                  <div className="col-span-4 sm:col-span-4">
                    <label htmlFor="contract-network" className="block text-sm font-medium text-gray-700">
                      Contract Network
                    </label>
                    <select
                      id="contract-network"
                      name="contract-network"
                      value={coinNetwork}
                      onChange={e => setCoinNetwork(e.target.value)}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      {coinNetworks.map(net => <option key={net.rpc} value={net.rpc}>{net.name}</option>)}
                    </select>
                  </div>
                  {/* CONTRACT ADDRESS */}
                  <div className="col-span-6">
                    <label htmlFor="contract-address" className="block text-sm font-medium text-gray-700">
                      Contract Address
                    </label>
                    <input
                      value={coinContract}
                      onChange={e => setCoinContract(e.target.value)}
                      type="text"
                      name="contract-address"
                      id="contract-address"
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                <button
                  onClick={handleSubmit}
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Create;