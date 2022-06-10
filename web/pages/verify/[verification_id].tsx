import Head from 'next/head'
import { usePreferences } from '../../containers/preferences';
import { useEffect, useState } from 'react';
import { SERVER_BASE_PATH, SERVER_AUTH_DISCORD } from '@rumble-raffle-dao/types/constants';
import { BASE_API_URL } from '../../lib/constants';
import { AuthDiscordVerifyGetResponse, AuthStoreValue } from '@rumble-raffle-dao/types';

export async function getServerSideProps(context): Promise<{ props: AuthStoreValue }> {
  const { verification_id } = context.query;
  const { data } = await fetch(`${BASE_API_URL}${SERVER_BASE_PATH}${SERVER_AUTH_DISCORD}/${verification_id}`).then(res => res.json()) as AuthDiscordVerifyGetResponse

  return {
    props: {
      ...data,
    }
  }
}

const pageTitle = `Verify Discord`
export default function PageIndex(props: AuthStoreValue) {
  const { preferences } = usePreferences();

  console.log('--props', props);

  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setDarkMode(preferences?.darkMode);
  }, [preferences?.darkMode]);

  if (!props.discord_tag) {
    return (
      <div className={`${darkMode ? 'dark' : 'light'}`}>
        <Head>
          <title>{pageTitle}</title>
          <meta name="description" content="Verify Discord" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className="p-8 dark:bg-black bg-rumbleBgLight w-full overflow-auto scrollbar-thin dark:scrollbar-thumb-rumbleSecondary scrollbar-thumb-rumblePrimary scrollbar-track-rumbleBgDark" style={{ height: 'calc(100vh - 58px)' }}>
          <h1 className='uppercase font-medium mt-6 mb-12 text-2xl text-center dark:text-rumbleSecondary text-rumblePrimary'>Discord Verification</h1>
          <section className='md:px-40 sm:px-8'>
            <p className='text-xl text-center mb-2 dark:text-rumbleNone text-rumbleOutline'>
              Looks like you stepped in the wrong neighborhood, homie.
            </p>
            <h2 className='text-center uppercase mb-2 text-xl dark:text-rumbleSecondary text-rumblePrimary'>Uh oh..</h2>
          </section>
        </div>
      </div>
    )
  }

  const buttonClass = "inline-block mr-4 px-6 py-4 dark:bg-rumbleNone bg-rumbleOutline dark:text-black text-rumbleNone text-xs uppercase transition duration-150 ease-in-out dark:hover:bg-rumbleSecondary hover:bg-rumblePrimary dark:focus:bg-rumbleSecondary focus:bg-rumblePrimary"

  return (
    <div className={`${darkMode ? 'dark' : 'light'}`}>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content="Verify Discord" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="p-8 dark:bg-black bg-rumbleBgLight w-full overflow-auto scrollbar-thin dark:scrollbar-thumb-rumbleSecondary scrollbar-thumb-rumblePrimary scrollbar-track-rumbleBgDark" style={{ height: 'calc(100vh - 58px)' }}>
        <h1 className='uppercase font-medium mt-6 mb-12 text-2xl text-center dark:text-rumbleSecondary text-rumblePrimary'>Discord Verification</h1>
        <section className='md:px-40 sm:px-8'>
          <h2 className='uppercase mb-2 text-xl dark:text-rumbleSecondary text-rumblePrimary'>Let's get you verified!</h2>
          <p className='mb-2 dark:text-rumbleNone text-rumbleOutline'>
            Are you {props.discord_tag}?
          </p>
          <button className={buttonClass}>Verify Me!</button>
        </section>
      </div>
    </div>
  )
}