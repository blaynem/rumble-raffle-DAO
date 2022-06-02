/**
 * Because this will only be used by admins for now, it doesn't need to be pretty.
 */
import { ToastTypes } from '@rumble-raffle-dao/types';
import Link from 'next/link';
import React, { useState } from 'react';
import ToastMessage from '../components/toast';
import { usePreferences } from '../containers/preferences';
import { useUser } from '../containers/userHook';
import { BASE_WEB_URL } from '../lib/constants';
import { CreateRoomBody } from './api/create';

// eslint-disable-next-line
const onSuccessSlugUrlMessage = (slug: string) => <Link href={`/room/${slug}`}><a className="inline-flex items-center dark:text-rumbleNone text-rumbleOutline">{`${BASE_WEB_URL}/room/${slug}`}</a></Link>

const Create = () => {
  const { user } = useUser();
  const { preferences } = usePreferences();
  const [slug, setSlug] = useState('');
  const [pve_chance, setPveChance] = useState('');
  const [revive_chance, setReviveChance] = useState('');
  // 0x8f06208951E202d30769f50FAec22AEeC7621BE2 = sFNC, this should be changed, duh
  const [contract_address, setContractAddress] = useState('0x8f06208951E202d30769f50FAec22AEeC7621BE2');
  const [isSubmitting, setSubmitting] = useState(false);
  // State
  const [toastOpen, setToastOpen] = useState(false);
  const [toast, setToast] = useState(null as ToastTypes);
  const [savedSlugMessage, setSavedSlugMessage] = useState("");

  const onSubmit = async () => {
    const createBody: CreateRoomBody = {
      slug,
      contract_address,
      createdBy: user.id,
      pve_chance,
      revive_chance
    }

    await fetch('/api/create', {
      method: 'POST',
      body: JSON.stringify(createBody)
    }).then(res => res.json())
      .then((res) => {
        if (res.error) {
          console.error(res.error)
          setSubmitting(false);
          handleSetToast({ type: 'ERROR', message: res.error });
          return;
        }
        setSubmitting(false);
        handleSetToast({ type: 'SUCCESS', message: `Created room ${slug}` });
        setSavedSlugMessage(slug);
      })
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

  const fieldContainerClass = 'mb-4';
  const headerClass = "mb-2 uppercase leading-7 text-lg font-medium dark:text-rumbleSecondary text-rumblePrimary";
  const fieldClass = 'p-4 h-14 dark:focus:ring-rumbleNone focus:ring-rumbleOutline dark:focus:border-rumbleNone focus:border-rumbleOutline dark:bg-rumbleBgDark bg-rumbleNone dark:text-rumbleNone text-rumbleOutline flex-1 block w-full border-none';
  const labelClass = "mb-1 uppercase block text-base font-medium leading-6 dark:text-rumbleNone text-rumbleOutline";
  return (
    <div className={`${preferences?.darkMode ? 'dark' : 'light'}`}>
      <div className='dark:bg-black bg-rumbleBgLight w-full mx-auto py-8 px-6 lg:px-[15%] md:px-[10%] sm:px-10 overflow-auto scrollbar-thin dark:scrollbar-thumb-rumbleSecondary scrollbar-thumb-rumblePrimary scrollbar-track-rumbleBgDark"' style={{ height: 'calc(100vh - 58px)' }}>
        <h4 className={headerClass}>New Room Params</h4>
        <div className={fieldContainerClass}>
          <label className={labelClass} htmlFor="slug">Slug</label>
          <input
            onChange={(e) => setSlug(e.target.value)}
            value={slug}
            className={fieldClass}
            id="slug"
            placeholder='Room Slug' />
        </div>
        <div className={fieldContainerClass}>
          <label className={labelClass} htmlFor="pve_chance">PVE Chance</label>
          <input
            onChange={(e) => setPveChance(e.target.value)}
            value={pve_chance}
            className={fieldClass}
            id="pve_chance"
            placeholder='PVE Chance' />
        </div>
        <div className={fieldContainerClass}>
          <label className={labelClass} htmlFor="revive_chance">Revive Chance</label>
          <input
            onChange={(e) => setReviveChance(e.target.value)}
            value={revive_chance}
            className={fieldClass}
            id="revive_chance"
            placeholder='Revive Chance' />
        </div>
        <div className={fieldContainerClass}>
          <label className={labelClass} htmlFor="contractId">Contract Id</label>
          <input
            onChange={(e) => setContractAddress(e.target.value)}
            value={contract_address}
            className={fieldClass}
            id="contractId"
            placeholder='Contract Address' />
        </div>
        <button
          onClick={onSubmit}
          className="uppercase h-14 mr-8 py-4 px-6 border-2 dark:border-rumbleBgLight border-rumbleBgDark dark:bg-rumbleBgLight bg-rumbleBgDark dark:hover:bg-rumbleSecondary dark:hover:border-rumbleSecondary hover:bg-rumblePrimary hover:border-rumblePrimary dark:text-rumbleOutline text-rumbleNone font-medium"
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
        {/* Setting empty div allows button to always flex all the way right. */}
        {savedSlugMessage ? onSuccessSlugUrlMessage(savedSlugMessage) : <div />}
        <div className='absolute top-2 right-2 z-20'>
          {toastOpen && <ToastMessage message={toast.message} type={toast.type} onClick={() => handleSetToast(null)} />}
        </div>
      </div>
    </div>
  )
}

export default Create;