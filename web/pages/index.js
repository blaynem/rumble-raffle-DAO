import Head from 'next/head'
import { usePreferences } from '../containers/preferences';
import { useEffect, useState } from 'react';
import { DEFAULT_ROOM_URL, DISCORD_LINK } from '@rumble-raffle-dao/types/constants';
import { useRouter } from 'next/router';

/**
 * TODO:
 * - Better error handling on client side so when errors happen we don't blow up the app.
 */

const pageTitle = `Rumble Raffle DAO`
export default function PageIndex() {
  const { preferences } = usePreferences();
  const router = useRouter();

  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setDarkMode(preferences?.darkMode);
  }, [preferences?.darkMode]);

  return (
    <div className={`${darkMode ? 'dark' : 'light'}`}>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content="Rumble Raffle DAO" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="p-8 dark:bg-black bg-rumbleBgLight w-full overflow-auto scrollbar-thin dark:scrollbar-thumb-rumbleSecondary scrollbar-thumb-rumblePrimary scrollbar-track-rumbleBgDark" style={{ height: 'calc(100vh - 58px)' }}>
        <h1 className='uppercase font-medium mt-6 mb-12 text-2xl text-center dark:text-rumbleSecondary text-rumblePrimary'>Welcome to Rumble Raffle!</h1>
        <section className='md:px-40 sm:px-8'>
          <h2 className='uppercase mb-2 text-xl dark:text-rumbleSecondary text-rumblePrimary'>What the heck is this?</h2>
          <p className='mb-8 dark:text-rumbleNone text-rumbleOutline'>
            Rumble Raffle is a completely randomized, free to play game where players fight to the <span className='dark:text-rumbleSecondary text-rumblePrimary'>(</span>simulated<span className='dark:text-rumbleSecondary text-rumblePrimary'>)</span> death to earn RUMBLE Tokens. The more players you kill, the more RUMBLE tokens you earn.
          </p>

          <h2 className='uppercase mb-2 text-xl dark:text-rumbleSecondary text-rumblePrimary'>What the heck are those?</h2>
          <p className='mb-8 dark:text-rumbleNone text-rumbleOutline'>
            RUMBLE Tokens are a cryptocurrency that are used to purchase and upgrade Weapon NFTs.
          </p>

          <h2 className='uppercase mb-2 text-xl dark:text-rumbleSecondary text-rumblePrimary'>Why the heck would I want that?</h2>
          <p className='mb-8 dark:text-rumbleNone text-rumbleOutline'>
            The higher rarity Weapon you hold, the more RUMBLE tokens you can acquire in a single game. Holding higher rarity weapons could lead to special rewards / raffle opportunities in the future!
          </p>

          <h2 className='uppercase mb-2 text-xl dark:text-rumbleSecondary text-rumblePrimary'>What the heck is the catch?</h2>
          <p className='mb-8 dark:text-rumbleNone text-rumbleOutline'>
            There is none. We saw how much people enjoyed playing raffle type games in discord, and figured why not create a similar experience that allows complete ownership of the items you earn.
            In the future we&apos;ll be implementing exciting features with higher risks, and even greater rewards.
          </p>

          <h2 className='uppercase mb-2 text-xl dark:text-rumbleSecondary text-rumblePrimary'>Sounds heckin great, how do I play?</h2>
          <p className='dark:text-rumbleNone text-rumbleOutline'>Heck yeah! It&apos;s as simple as 123.</p>
          <ol className='mb-8 dark:text-rumbleNone text-rumbleOutline'>
            <li>1. Connect your MetaMask and Sign the message.</li>
            <li>2. Click <button onClick={() => router.push(DEFAULT_ROOM_URL)} className="uppercase dark:text-rumbleSecondary text-rumblePrimary">Play</button>.</li>
            <li>3. Click &quot;Join Game&quot;.</li>
          </ol>

          <h2 className='uppercase mb-2 text-xl dark:text-rumbleSecondary text-rumblePrimary'>Where the heck can I learn more?</h2>
          <p className='dark:text-rumbleNone text-rumbleOutline'>The best place for information will be the discord which can be found <a rel="noreferrer noopener" target="_blank" href={DISCORD_LINK} className="uppercase dark:text-rumbleSecondary text-rumblePrimary">here</a>.</p>
        </section>
      </div>
    </div>
  )
}