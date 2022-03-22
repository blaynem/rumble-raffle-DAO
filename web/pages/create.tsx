import React, { useState } from 'react';
import Link from 'next/link';
import { Formik, Field, Form, FormikHelpers, ErrorMessage, FormikTouched } from 'formik';
import { useWallet } from '../containers/wallet';
import { SupabaseUserType } from './api/auth';
import createRoomSchema from '../lib/schemaValidations/createRoom';
import ToastMessage, { ToastTypes } from '../components/toast';
import { GetPolyContractReturnType, getPolygonContractData } from '../lib/PolygonscanFetches';

type ContractType = {
  // Ex: Polygon
  network_name: string;
  // Ex: https://polygon-rpc.com/
  network_rpc: string;
} & GetPolyContractReturnType;

interface Values {
  alt_split_address: string;
  entry_fee: string;
  contract: ContractType;
  pve_chance: string;
  revive_chance: string;
  prize_split: {
    prize_alt_split: string;
    prize_kills: string;
    prize_first: string;
    prize_second: string;
    prize_third: string;
    prize_creator: string;
  }
  user: SupabaseUserType
  slug: string,
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

async function checkSlugAvailable(slug: string) {
  const { data } = await fetch(`http://localhost:3001/api/rooms/${slug}`).then(res => res.json())
  return data;
}

const customPrizeSplitMessage = (errorMsg: string, touched: FormikTouched<Values>) => {
  let message = null;
  const {
    prize_alt_split,
    prize_first,
    prize_second,
    prize_third,
    prize_kills,
  } = touched.prize_split;
  // if all prize fields have been touched && if the error errorMsg is a string then we show the message.
  if (prize_alt_split && prize_first && prize_second && prize_third && prize_kills && typeof errorMsg === "string") {
    message = errorMsg;
  }
  return message ? <div className='px-4 space-y-6 sm:px-6'>{message}</div> : null;
}

const customContractErrorMessage = (errorMsg) => {

}

const customErrorColors = (msg: string) => <div className='text-red-600 py-2'>{msg}</div>

/**
 * TODO:
 * - Any time a contract is changed, we should require them to fetch again. 
 * - Should auto-fetch contracts on blur instead of requiring them to press a button.
 * - Should have a fetch from our own db to check for contract info, with the other fetch as a fallback
 */
const CreatePage = () => {
  const { user } = useWallet()
  // State
  const [toastOpen, setToastOpen] = useState(false);
  const [toast, setToast] = useState(null as ToastTypes);
  const [savedSlugMessage, setSavedSlugMessage] = useState("");
  // Probably dont need both these details in state and the ones in values.contract
  const [contractDetailsLoading, setContractDetailsLoading] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null as GetPolyContractReturnType);

  if (!user || !user.public_address) {
    return <PleaseLoginMessage />
  }


  const fetchContractData = async (
    setValues: (values: React.SetStateAction<Values>) => void,
    currentValues: Values,
    contractAddress: string
  ) => {
    setContractDetailsLoading(true)
    const data = await getPolygonContractData(contractAddress);
    setValues({
      ...currentValues,
      contract: {
        ...currentValues.contract,
        ...data,
      }
    });
    setSelectedContract(data);
    setContractDetailsLoading(false);
  }

  const handleSubmit = async (values: Values) => {
    return await fetch('/api/create', {
      method: 'POST',
      body: JSON.stringify({
        // ...tempBody
        user,
        ...values
      })
    }).then(res => res.json())
  }

  const handleSetToast = (options: ToastTypes | null) => {
    if (!options) {
      setToastOpen(false)
      return;
    }
    const { message, type } = options;
    setToast({ message, type })
    setToastOpen(true)
  }

  const onSuccessSlugUrlMessage = (slug: string) => <Link href={`/room/${slug}`}><a className="inline-flex items-center">{`http://localhost:3000/room/${slug}`}</a></Link>
  const showAltSplitAddress = (values: Values) => {
    const { prize_alt_split } = values.prize_split;
    return prize_alt_split !== '' && parseInt(prize_alt_split) > 0;
  }

  return (
    <Formik
      validationSchema={createRoomSchema}
      initialValues={{
        alt_split_address: '',
        contract: {
          chain_id: '',
          decimals: '',
          name: '',
          symbol: '',
          contract_address: coinContracts.sFNC.contract,
          network_rpc: coinNetworks[0].rpc,
          network_name: coinNetworks[0].name,
        },
        pve_chance: '',
        revive_chance: '',
        entry_fee: '',
        prize_split: {
          prize_alt_split: '',
          prize_kills: '',
          prize_first: '',
          prize_second: '',
          prize_third: '',
          prize_creator: '1',
        },
        slug: '',
        user,
      }}
      onSubmit={(
        values: Values,
        { setSubmitting, setFieldError, resetForm }: FormikHelpers<Values>
      ) => {
        setSubmitting(true);
        setSavedSlugMessage(undefined);
        checkSlugAvailable(values.slug).then((data) => {
          if (data.length > 0) {
            setFieldError('slug', 'Slug already taken.');
            setSubmitting(false)
            return;
          }
          // only submit if the slug is available to use
          handleSubmit(values).then((res) => {
            if (res.error) {
              setSubmitting(false);
              handleSetToast({ type: 'ERROR', message: 'There was an error creating the room.' });
              return;
            }
            setSubmitting(false);
            handleSetToast({ type: 'SUCCESS', message: `Created room ${values.slug}` });
            setSavedSlugMessage(values.slug);
            resetForm();
          })
        });
      }}
    >
      {({ isSubmitting, touched, values, setValues }) => (
        <Form>
          <div className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'>
            <div className="mt-10 sm:mt-0">
              <div className="md:grid md:grid-cols-3 md:gap-6">
                <div className="lg:col-span-1 md:col-span-3">
                  <div className="px-4 sm:px-0">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Create A Room</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      This information will be used to create a rumble room.
                    </p>
                  </div>
                  {toastOpen && <ToastMessage message={toast.message} type={toast.type} onClick={() => handleSetToast(null)} />}
                </div>
                <div className="mt-5 md:mt-0 lg:col-span-2 md:col-span-3">
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
                            <Field
                              type="text"
                              name="slug"
                              id="desired-slug"
                              className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300"
                              placeholder="abc123"
                            />
                          </div>
                          <ErrorMessage name="slug" >
                            {msg => customErrorColors(msg)}
                          </ErrorMessage>
                        </div>
                        {/* PVE CHANCE */}
                        <div className="col-span-2">
                          <label htmlFor="pve-chance" className="block text-sm font-medium text-gray-700">
                            PvE Chance
                          </label>
                          <div className="mt-1 flex rounded-md shadow-sm">
                            <Field
                              type="number"
                              name="pve_chance"
                              id="pve-chance"
                              className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                              placeholder="30"
                            />
                            <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                              %
                            </span>
                          </div>
                          <ErrorMessage name="pve_chance" >
                            {msg => customErrorColors(msg)}
                          </ErrorMessage>
                        </div>
                        {/* REVIVE CHANCE */}
                        <div className="col-span-2">
                          <label htmlFor="revive-chance" className="block text-sm font-medium text-gray-700">
                            Revive Chance
                          </label>
                          <div className="mt-1 flex rounded-md shadow-sm">
                            <Field
                              type="number"
                              name="revive_chance"
                              id="revive-chance"
                              className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                              placeholder="5"
                            />
                            <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                              %
                            </span>
                          </div>
                          <ErrorMessage name="revive_chance" >
                            {msg => customErrorColors(msg)}
                          </ErrorMessage>
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
                            <Field
                              type="number"
                              name="prize_split.prize_kills"
                              id="payout-kill"
                              className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                              placeholder="5"
                            />
                            <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                              %
                            </span>
                          </div>
                          <ErrorMessage name="prize_split.prize_kills" >
                            {msg => customErrorColors(msg)}
                          </ErrorMessage>
                        </div>
                      </div>
                      <div className="grid grid-cols-6 gap-6">
                        {/* FIRST PLACE SPLIT */}
                        <div className="col-span-1 xl:col-span-1 sm:col-span-2">
                          <label htmlFor="payout-prize_first" className="block text-sm font-medium text-gray-700">
                            First Place
                          </label>
                          <div className="mt-1 flex rounded-md shadow-sm">
                            <Field
                              type="number"
                              name="prize_split.prize_first"
                              id="payout-prize_first"
                              className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                              placeholder="5"
                            />
                            <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                              %
                            </span>
                          </div>
                          <ErrorMessage name="prize_split.prize_first" >
                            {msg => customErrorColors(msg)}
                          </ErrorMessage>
                        </div>
                        {/* SECOND PLACE SPLIT */}
                        <div className="col-span-1 xl:col-span-1 sm:col-span-2">
                          <label htmlFor="payout-prize_second" className="block text-sm font-medium text-gray-700">
                            Second Place
                          </label>
                          <div className="mt-1 flex rounded-md shadow-sm">
                            <Field
                              type="number"
                              name="prize_split.prize_second"
                              id="payout-prize_second"
                              className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                              placeholder="5"
                            />
                            <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                              %
                            </span>
                          </div>
                          <ErrorMessage name="prize_split.prize_second" >
                            {msg => customErrorColors(msg)}
                          </ErrorMessage>
                        </div>
                        {/* THIRD PLACE SPLIT */}
                        <div className="col-span-1 xl:col-span-1 sm:col-span-2">
                          <label htmlFor="payout-prize_third" className="block text-sm font-medium text-gray-700">
                            Third Place
                          </label>
                          <div className="mt-1 flex rounded-md shadow-sm">
                            <Field
                              type="number"
                              name="prize_split.prize_third"
                              id="payout-prize_third"
                              className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                              placeholder="5"
                            />
                            <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                              %
                            </span>
                          </div>
                          <ErrorMessage name="prize_split.prize_third" >
                            {msg => customErrorColors(msg)}
                          </ErrorMessage>
                        </div>
                        {/* ALT SPLIT */}
                        <div className="col-span-1 xl:col-span-1 sm:col-span-2">
                          <label htmlFor="payout-alternative" className="block text-sm font-medium text-gray-700">
                            Alternative Split
                          </label>
                          <div className="mt-1 flex rounded-md shadow-sm">
                            <Field
                              type="number"
                              name="prize_split.prize_alt_split"
                              id="payout-alternative"
                              className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                              placeholder="5"
                            />
                            <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                              %
                            </span>
                          </div>
                          <ErrorMessage name="prize_split.prize_alt_split" >
                            {msg => customErrorColors(msg)}
                          </ErrorMessage>
                        </div>
                        {/* RUMBLE RAFFLE SPLIT */}
                        <div className="col-span-1 xl:col-span-1 sm:col-span-2">
                          <label htmlFor="payout-creator" className="block text-sm font-medium text-gray-700">
                            Rumble Raffle
                          </label>
                          <div className="mt-1 flex rounded-md shadow-sm">
                            <Field
                              disabled
                              type="number"
                              name="prize_split.prize_creator"
                              id="payout-creator"
                              className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                              placeholder="1"
                            />
                            <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                              %
                            </span>
                          </div>
                        </div>
                      </div>
                      {showAltSplitAddress(values) && <div className="col-span-6">
                        <label htmlFor="prize_alt_split-address" className="block text-sm font-medium text-gray-700">
                          Alternative Split Address
                        </label>
                        <Field
                          type="text"
                          name="alt_split_address"
                          id="prize_alt_split-address"
                          placeholder="Wallet Address"
                          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                        <ErrorMessage name="alt_split_address" >
                          {msg => customErrorColors(msg)}
                        </ErrorMessage>
                      </div>}
                    </div>
                    <ErrorMessage render={msg => customPrizeSplitMessage(msg, touched)} name="prize_split" >
                      {msg => customErrorColors(msg)}
                    </ErrorMessage>
                    {/* COIN INFORMATION */}
                    <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                      <h4 className="text-base font-medium text-gray-900">Payment Information</h4>
                      <div className="grid grid-cols-6 gap-6">
                        {/* CONTRACT NETWORK */}
                        <div className="col-span-2 sm:col-span-2">
                          <label htmlFor="contract-network" className="block text-sm font-medium text-gray-700">
                            Contract Network
                          </label>
                          <Field
                            as="select"
                            id="contract-network"
                            name="contract.network_name"
                            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          >
                            {coinNetworks.map(net => <option key={net.rpc} value={net.rpc}>{net.name}</option>)}
                          </Field>
                          <ErrorMessage name="contract.network_name" >
                            {msg => customErrorColors(msg)}
                          </ErrorMessage>
                        </div>
                        {/* CONTRACT ADDRESS */}
                        <div className="md:col-span-4 sm:col-span-6">
                          <label htmlFor="contract-address" className="block text-sm font-medium text-gray-700">
                            Contract Address
                          </label>
                          <Field
                            type="text"
                            name="contract.contract_address"
                            id="contract-address"
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          />
                          <ErrorMessage name="contract.contract_address" >
                            {msg => customErrorColors(msg)}
                          </ErrorMessage>
                        </div>
                        <button
                          type="button"
                          onClick={() => fetchContractData(setValues, values, values.contract.contract_address)}
                          className="sm:col-span-6 py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          {contractDetailsLoading ? "Loading..." : "Fetch Contract Data"}
                        </button>
                        {/* ENTRY COST */}
                        {!selectedContract ?
                          <div className='sm:col-span-6'>Please click the button above to fetch contract data.</div>
                          :
                          <>
                            <div className="col-span-2">
                              <label htmlFor="entry-fee" className="block text-sm font-medium text-gray-700">
                                Entry Fee
                              </label>
                              <div className="mt-1 flex rounded-md shadow-sm">
                                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                  {selectedContract.symbol}
                                </span>
                                <Field
                                  type="number"
                                  name="entry_fee"
                                  id="entry-fee"
                                  className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300"
                                  placeholder="10"
                                />
                              </div>
                              <ErrorMessage name="entry_fee" >
                                {msg => customErrorColors(msg)}
                              </ErrorMessage>
                            </div>
                            <div className="col-span-4">
                              <p className="block text-sm font-medium text-gray-700">
                                Token Information
                              </p>
                              <p className="block text-sm font-medium text-gray-700">Name: {selectedContract.name}</p>
                              <p className="block text-sm font-medium text-gray-700">Symbol: {selectedContract.symbol}</p>
                              <p className="block text-sm font-medium text-gray-700">Decimal: {selectedContract.decimals}</p>
                            </div>
                          </>
                        }
                      </div>
                    </div>
                    <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 flex justify-between">
                      {/* Setting empty div allows button to always flex all the way right. */}
                      {savedSlugMessage ? onSuccessSlugUrlMessage(savedSlugMessage) : <div />}
                      <button
                        type="submit"
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        {isSubmitting ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Form>
      )}
    </Formik >
  )
}

export default CreatePage;