/* eslint-disable */

/**
 * This file was created before we switched up the model in how we play. Keeping it here for now because it might come in handy in the future.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { Formik, Field, Form, FormikHelpers, ErrorMessage, FormikTouched } from 'formik';
import { useUser } from '../containers/userHook';
import createRoomSchema from '../lib/schemaValidations/createRoom';
import ToastMessage from '../components/toast';
import { GetPolyContractReturnType, CreateRoomValues, ToastTypes } from '@rumble-raffle-dao/types';
import { BASE_API_URL, BASE_WEB_URL } from '../lib/constants';
import { usePreferences } from '../containers/preferences';

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

const AlternativeMessage = ({ message }: { message: string }) => {
  return (
    <div className='p-8 text-center'>
      <h2 className="text-lg leading-6 font-medium text-gray-900">{message}</h2>
    </div>
  )
}

async function checkSlugAvailable(slug: string) {
  const { data } = await fetch(`${BASE_API_URL}/api/rooms/${slug}`).then(res => res.json())
  return data;
}

const customPrizeSplitMessage = (errorMsg: string, touched: FormikTouched<CreateRoomValues>) => {
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
  return message ? <div className='text-base h-10 py-2 text-red-600'>{message}</div> : null;
}

const customErrorColors = (msg: string) => <div className='text-base h-10 text-red-600 py-2'>{msg}</div>

/**
 * TODO:
 * - LIMIT THIS TO ONLY ADMINS OR PEOPLE WE GIVE POWER TO FOR NOW REEEE
 * - Any time a contract is changed, we should require them to fetch again. 
 * - Should auto-fetch contracts on blur instead of requiring them to press a button.
 */
const CreatePage = () => {
  const { user } = useUser()
  const { preferences } = usePreferences();
  // State
  const [toastOpen, setToastOpen] = useState(false);
  const [toast, setToast] = useState(null as ToastTypes);
  const [savedSlugMessage, setSavedSlugMessage] = useState("");
  // Probably dont need both these details in state and the ones in values.contract
  const [contractDetailsLoading, setContractDetailsLoading] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null as GetPolyContractReturnType);
  
  return <AlternativeMessage message="Nope." />

  if (!user || !user.id) {
    return <AlternativeMessage message="You must login before creating a room." />
  }

  if (!user.is_admin) {
    return <AlternativeMessage message="Only admins can create a room at this time. Sorry about that." />
  }


  const fetchContractData = async (
    setValues: (values: React.SetStateAction<CreateRoomValues>) => void,
    values: CreateRoomValues,
  ) => {
    setContractDetailsLoading(true)
    const { data } = await fetch(`/api/contracts?contract_address=${values.contract.contract_address}&network_name=${values.contract.network_name}`)
      .then(res => res.json())
    setValues({
      ...values,
      contract: {
        ...values.contract,
        ...data,
      }
    });
    setSelectedContract(data);
    setContractDetailsLoading(false);
  }

  const handleSubmit = async (values: CreateRoomValues) => {
    return await fetch('/api/create', {
      method: 'POST',
      body: JSON.stringify({
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

  const onSuccessSlugUrlMessage = (slug: string) => <Link href={`/room/${slug}`}><a className="inline-flex items-center dark:text-rumbleNone text-rumbleOutline">{`${BASE_WEB_URL}/room/${slug}`}</a></Link>
  const showAltSplitAddress = (values: CreateRoomValues) => {
    const { prize_alt_split } = values.prize_split;
    return prize_alt_split !== '' && parseInt(prize_alt_split) > 0;
  }

  const headerClass = "mb-2 uppercase leading-7 text-lg font-medium dark:text-rumbleSecondary text-rumblePrimary";
  const fieldClass = 'h-14 dark:focus:ring-rumbleNone focus:ring-rumbleOutline dark:focus:border-rumbleNone focus:border-rumbleOutline dark:bg-rumbleBgDark bg-rumbleNone dark:text-rumbleNone text-rumbleOutline flex-1 block w-full border-none';
  const labelClass = "mb-1 uppercase block text-base font-medium leading-6 dark:text-rumbleNone text-rumbleOutline";
  const spanClass = "inline-flex items-center px-3 dark:bg-rumbleBgDark bg-rumbleNone dark:text-rumbleNone/40 text-rumbleOutline/40 text-base";

  return (
    <Formik
      validationSchema={createRoomSchema}
      initialValues={{
        alt_split_address: '',
        contract: {
          chain_id: null,
          decimals: '',
          name: '',
          symbol: '',
          contract_address: coinContracts.sFNC.contract,
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
        values: CreateRoomValues,
        { setSubmitting, setFieldError, resetForm }: FormikHelpers<CreateRoomValues>
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
        <Form className={`${preferences?.darkMode ? 'dark' : 'light'}`}>
          <div className='dark:bg-black bg-rumbleBgLight w-full mx-auto py-8 px-6 lg:px-[15%] md:px-[10%] sm:px-10 overflow-auto scrollbar-thin dark:scrollbar-thumb-rumbleSecondary scrollbar-thumb-rumblePrimary scrollbar-track-rumbleBgDark"' style={{ height: 'calc(100vh - 58px)' }}>
            <div className='absolute top-2 right-2 z-20'>
              {toastOpen && <ToastMessage message={toast.message} type={toast.type} onClick={() => handleSetToast(null)} />}
            </div>
            <h3 className="uppercase text-2xl font-medium leading-9 dark:text-rumbleNone text-rumbleOutline">Create A Room</h3>
            <p className="mb-20 text-base leading-6 dark:text-rumbleNone text-rumbleOutline opacity-60">
              This information will be used to create a rumble room.
            </p>
            <div className="">
              <div className="">
                <div className="mb-20">
                  <h4 className={headerClass}>Game Details</h4>
                  <div className="grid grid-cols-7 gap-6">
                    {/* SLUG */}
                    <div className="col-span-7 sm:col-span-3">
                      <label htmlFor="desired-slug" className={labelClass}>
                        Slug
                      </label>
                      <div className="flex">
                        <span className={spanClass}>
                          /
                        </span>
                        <Field
                          type="text"
                          name="slug"
                          id="desired-slug"
                          className={fieldClass}
                          placeholder="rumble-room-2"
                        />
                      </div>
                      <ErrorMessage name="slug" >
                        {msg => customErrorColors(msg)}
                      </ErrorMessage>
                    </div>
                    {/* PVE CHANCE */}
                    <div className="col-span-7 sm:col-span-2">
                      <label htmlFor="pve-chance" className={labelClass}>
                        PvE Chance
                      </label>
                      <div className="flex">
                        <Field
                          type="number"
                          name="pve_chance"
                          id="pve-chance"
                          className={fieldClass}
                          placeholder="30"
                        />
                        <span className="inline-flex items-center px-3 dark:bg-rumbleBgDark bg-rumbleNone dark:text-rumbleNone/40 text-rumbleOutline/40 text-base">
                          %
                        </span>
                      </div>
                      <ErrorMessage name="pve_chance" >
                        {msg => customErrorColors(msg)}
                      </ErrorMessage>
                    </div>
                    {/* REVIVE CHANCE */}
                    <div className="col-span-7 sm:col-span-2">
                      <label htmlFor="revive-chance" className={labelClass}>
                        Revive Chance
                      </label>
                      <div className="flex">
                        <Field
                          type="number"
                          name="revive_chance"
                          id="revive-chance"
                          className={fieldClass}
                          placeholder="5"
                        />
                        <span className={spanClass}>
                          %
                        </span>
                      </div>
                      <ErrorMessage name="revive_chance" >
                        {msg => customErrorColors(msg)}
                      </ErrorMessage>
                    </div>
                  </div>
                </div>
                <div className="mb-20">
                  <h4 className={headerClass}>Prize Split</h4>
                  <div className="mb-6 grid grid-cols-6 gap-6">
                    {/* KILL COUNT SPLIT */}
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="payout-kill" className={labelClass}>
                        Kills
                      </label>
                      <div className="flex">
                        <Field
                          type="number"
                          name="prize_split.prize_kills"
                          id="payout-kill"
                          className={fieldClass}
                          placeholder="5"
                        />
                        <span className={spanClass}>
                          %
                        </span>
                      </div>
                      <ErrorMessage name="prize_split.prize_kills" >
                        {msg => customErrorColors(msg)}
                      </ErrorMessage>
                    </div>
                  </div>
                  <div className="mb-6 grid grid-cols-7 gap-6">
                    {/* FIRST PLACE SPLIT */}
                    <div className="col-span-7 lg:col-span-1 md:col-span-2 sm:col-span-3">
                      <label htmlFor="payout-prize_first" className={labelClass}>
                        1st Place
                      </label>
                      <div className="flex">
                        <Field
                          type="number"
                          name="prize_split.prize_first"
                          id="payout-prize_first"
                          className={fieldClass}
                          placeholder="5"
                        />
                        <span className={spanClass} >
                          %
                        </span>
                      </div>
                      <ErrorMessage name="prize_split.prize_first" >
                        {msg => customErrorColors(msg)}
                      </ErrorMessage>
                    </div>
                    {/* SECOND PLACE SPLIT */}
                    <div className="col-span-7 lg:col-span-1 md:col-span-2 sm:col-span-3">
                      <label htmlFor="payout-prize_second" className={labelClass}>
                        2nd Place
                      </label>
                      <div className="flex">
                        <Field
                          type="number"
                          name="prize_split.prize_second"
                          id="payout-prize_second"
                          className={fieldClass}
                          placeholder="5"
                        />
                        <span className={spanClass}>
                          %
                        </span>
                      </div>
                      <ErrorMessage name="prize_split.prize_second" >
                        {msg => customErrorColors(msg)}
                      </ErrorMessage>
                    </div>
                    {/* THIRD PLACE SPLIT */}
                    <div className="col-span-7 lg:col-span-1 md:col-span-2 sm:col-span-3">
                      <label htmlFor="payout-prize_third" className={labelClass}>
                        3rd Place
                      </label>
                      <div className="flex">
                        <Field
                          type="number"
                          name="prize_split.prize_third"
                          id="payout-prize_third"
                          className={fieldClass}
                          placeholder="5"
                        />
                        <span className={spanClass}>
                          %
                        </span>
                      </div>
                      <ErrorMessage name="prize_split.prize_third" >
                        {msg => customErrorColors(msg)}
                      </ErrorMessage>
                    </div>
                    {/* ALT SPLIT */}
                    <div className="col-span-7 md:col-span-2 sm:col-span-3">
                      <label htmlFor="payout-alternative" className={labelClass}>
                        Alternative Split
                      </label>
                      <div className="flex">
                        <Field
                          type="number"
                          name="prize_split.prize_alt_split"
                          id="payout-alternative"
                          className={fieldClass}
                          placeholder="5"
                        />
                        <span className={spanClass}>
                          %
                        </span>
                      </div>
                      <ErrorMessage name="prize_split.prize_alt_split" >
                        {msg => customErrorColors(msg)}
                      </ErrorMessage>
                    </div>
                    {/* RUMBLE RAFFLE SPLIT */}
                    <div className="col-span-7 md:col-span-2 sm:col-span-3">
                      <label htmlFor="payout-creator" className={labelClass}>
                        Rumble Raffle
                      </label>
                      <div className="flex">
                        <Field
                          disabled
                          type="number"
                          name="prize_split.prize_creator"
                          id="payout-creator"
                          className={fieldClass}
                          placeholder="1"
                        />
                        <span className={spanClass}>
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                  <ErrorMessage render={msg => customPrizeSplitMessage(msg, touched)} name="prize_split" >
                    {msg => customErrorColors(msg)}
                  </ErrorMessage>
                  {showAltSplitAddress(values) && (
                    <div className="col-span-6">
                      <label htmlFor="prize_alt_split-address" className={labelClass}>
                        Alternative Split Address
                      </label>
                      <Field
                        type="text"
                        name="alt_split_address"
                        id="prize_alt_split-address"
                        placeholder="Wallet Address"
                        className={fieldClass}
                      />
                      <ErrorMessage name="alt_split_address" >
                        {msg => customErrorColors(msg)}
                      </ErrorMessage>
                    </div>
                  )}
                </div>
                {/* COIN INFORMATION */}
                <div className="mb-20">
                  <h4 className={headerClass}>Payment Information</h4>
                  <div className="grid grid-cols-7 gap-6">
                    {/* ENTRY COST */}
                    <div className="col-span-7 grid grid-cols-7 gap-6">
                      <div className="col-span-6 md:col-span-2 sm:col-span-3">
                        <label htmlFor="entry-fee" className={labelClass}>
                          Entry Fee
                        </label>
                        <div className="flex">
                          <span className={spanClass}>
                            {selectedContract ? selectedContract.symbol : ''}
                          </span>
                          <Field
                            type="number"
                            name="entry_fee"
                            id="entry-fee"
                            className={fieldClass}
                            placeholder="10"
                          />
                        </div>
                        <ErrorMessage name="entry_fee" >
                          {msg => customErrorColors(msg)}
                        </ErrorMessage>
                      </div>
                      <div className="col-span-6 md:col-span-4 sm:col-span-4 w-full" />
                    </div>
                    {/* CONTRACT NETWORK */}
                    <div className="col-span-7 md:col-span-2 sm:col-span-4">
                      <label htmlFor="contract-network" className={labelClass}>
                        Contract Network
                      </label>
                      <Field
                        as="select"
                        id="contract-network"
                        name="contract.network_name"
                        className={fieldClass}
                      >
                        {coinNetworks.map(net => <option key={net.rpc} value={net.rpc}>{net.name}</option>)}
                      </Field>
                      <ErrorMessage name="contract.network_name" >
                        {msg => customErrorColors(msg)}
                      </ErrorMessage>
                    </div>
                    {/* CONTRACT ADDRESS */}
                    <div className="col-span-7 md:col-span-3 sm:col-span-4">
                      <label htmlFor="contract-address" className={labelClass}>
                        Contract Address
                      </label>
                      <Field
                        type="text"
                        name="contract.contract_address"
                        id="contract-address"
                        className={fieldClass}
                      />
                      <ErrorMessage name="contract.contract_address" >
                        {msg => customErrorColors(msg)}
                      </ErrorMessage>
                    </div>
                    <div className="col-span-4 lg:col-span-2 md:col-span-3 sm:col-span-3 flex">
                      <button
                        type="button"
                        onClick={() => fetchContractData(setValues, values)}
                        className="truncate uppercase place-self-end h-14 py-4 px-6 border-2 dark:border-rumbleBgLight border-rumbleBgDark dark:bg-rumbleBgDark bg-rumbleBgLight dark:text-rumbleNone dark:hover:bg-rumbleSecondary dark:hover:border-rumbleSecondary hover:bg-rumblePrimary hover:border-rumblePrimary hover:text-rumbleNone text-rumbleOutline font-medium"
                      >
                        {contractDetailsLoading ? "Loading..." : "Fetch Contract Data"}
                      </button>
                    </div>
                    {/* TOKEN INFORMATION */}
                    {!selectedContract ?
                      <div className='col-span-7'>Please fetch contract data before continuing.</div>
                      :
                      // <div className="col-span-7 grid grid-cols-6 gap-6">
                      <div className="col-span-6 md:col-span-2 sm:col-span-3">
                        <p className={labelClass}>
                          Token Information
                        </p>
                        <p className={labelClass}>Name: <span className='font-normal'>{selectedContract.name}</span></p>
                        <p className={labelClass}>Symbol: <span className='font-normal'>{selectedContract.symbol}</span></p>
                        <p className={labelClass}>Decimal: <span className='font-normal'>{selectedContract.decimals}</span></p>
                        <p className={labelClass}>Chain Id: <span className='font-normal'>{selectedContract.chain_id}</span></p>
                      </div>
                      // </div>
                    }
                  </div>
                </div>
                <div>
                  <button
                    type="submit"
                    className="uppercase h-14 mr-8 py-4 px-6 border-2 dark:border-rumbleBgLight border-rumbleBgDark dark:bg-rumbleBgLight bg-rumbleBgDark dark:hover:bg-rumbleSecondary dark:hover:border-rumbleSecondary hover:bg-rumblePrimary hover:border-rumblePrimary dark:text-rumbleOutline text-rumbleNone font-medium"
                  >
                    {isSubmitting ? 'Saving...' : 'Save'}
                  </button>
                  {/* Setting empty div allows button to always flex all the way right. */}
                  {savedSlugMessage ? onSuccessSlugUrlMessage(savedSlugMessage) : <div />}
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