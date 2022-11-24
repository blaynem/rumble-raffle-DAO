import Head from 'next/head'
import { usePreferences } from '../containers/preferences';
import { useEffect, useState } from 'react';
import { DISCORD_LINK, TWITTER_HANDLE, TWITTER_LINK } from '@rumble-raffle-dao/types/constants';
// import { DEFAULT_ROOM_URL, DISCORD_LINK, TWITTER_HANDLE, TWITTER_LINK, WHITE_PAPER_GIST } from '@rumble-raffle-dao/types/constants';
// import { useRouter } from 'next/router';

/**
 * TODO:
 * - Better error handling on client side so when errors happen we don't blow up the app.
 */

const pageTitle = `Rumble Raffle`
export default function PageIndex() {
  const { preferences } = usePreferences();
  // const router = useRouter();

  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setDarkMode(preferences?.darkMode);
  }, [preferences?.darkMode]);

  return (
    <div className={`${darkMode ? 'dark' : 'light'}`}>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content="Rumble Raffle. Fight your friends, earn RUMBLE tokens. Join the discord for latest news!" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="p-8 dark:bg-black bg-rumbleBgLight w-full overflow-auto scrollbar-thin dark:scrollbar-thumb-rumbleSecondary scrollbar-thumb-rumblePrimary scrollbar-track-rumbleBgDark" style={{ height: 'calc(100vh - 58px)' }}>
        <h1 className='uppercase font-medium mt-6 mb-12 text-2xl text-center dark:text-rumbleSecondary text-rumblePrimary'>Welcome to Rumble Raffle!</h1>
        <section className='md:px-40 sm:px-8'>
          <h2 className='uppercase mb-2 text-xl dark:text-rumbleSecondary text-rumblePrimary'>What the heck is this?</h2>
          <p className='mb-8 dark:text-rumbleNone text-rumbleOutline'>
            Rumble Raffle is a completely randomized, free to play game where players fight to the <span className='dark:text-rumbleSecondary text-rumblePrimary'>(</span>simulated<span className='dark:text-rumbleSecondary text-rumblePrimary'>)</span> death to earn RMBLB Tokens. The more players you kill, the more RMBLB tokens you earn.
          </p>

          <h2 className='uppercase mb-2 text-xl dark:text-rumbleSecondary text-rumblePrimary'>What the heck are those?</h2>
          <p className='mb-8 dark:text-rumbleNone text-rumbleOutline'>
            {"RMBLB Tokens will be exchanged for a more customized experience! While we iron out all the details, we'll let you accumulate them in the background."}
          </p>
          {/* <p className='mb-8 dark:text-rumbleNone text-rumbleOutline'>
            RMBLB Tokens are a cryptocurrency that are used to purchase and upgrade Rumble NFTs.
          </p> */}

          {/* <h2 className='uppercase mb-2 text-xl dark:text-rumbleSecondary text-rumblePrimary'>Why the heck would I want that?</h2>
          <p className='mb-8 dark:text-rumbleNone text-rumbleOutline'>
            Holding Rumble NFTs allow you to increase your daily RMBLB earnings cap. Rumble NFT will also be required to participate in new games modes in the future.
          </p> */}

          {/* <h2 className='uppercase mb-2 text-xl dark:text-rumbleSecondary text-rumblePrimary'>What the heck is the catch?</h2>
          <p className='mb-8 dark:text-rumbleNone text-rumbleOutline'>
            There is none. We saw how much people enjoyed playing raffle type games in discord, and figured why not create a similar experience that allows complete ownership of the items you earn.
            In the future we&apos;ll be implementing exciting features with higher risks, and even greater rewards.
          </p> */}

          {/* <h2 className='uppercase mb-2 text-xl dark:text-rumbleSecondary text-rumblePrimary'>Sounds heckin great, how do I play?</h2>
          <p className='dark:text-rumbleNone text-rumbleOutline mb-4'>{"Heck yeah! There's two possible ways. The current easiest way is to join the "}<a rel="noreferrer noopener" target="_blank" href={DISCORD_LINK} className="dark:text-rumbleSecondary text-rumblePrimary">discord</a> and follow the prompts.</p>
          <p className='dark:text-rumbleNone text-rumbleOutline'>{"However if you'd prefer to play via the website, it's as easy as 1, 2, 3."}</p>
          <ol className='mb-8 dark:text-rumbleNone text-rumbleOutline'>
            <li>1. Connect your MetaMask and Sign the message.</li>
            <li>2. Click <button onClick={() => router.push(DEFAULT_ROOM_URL)} className="uppercase dark:text-rumbleSecondary text-rumblePrimary">Play</button>.</li>
            <li>3. Click &quot;Join Game&quot;.</li>
          </ol> */}

          <h2 className='uppercase mb-2 text-xl dark:text-rumbleSecondary text-rumblePrimary'>Where the heck can I learn more?</h2>
          <p className='dark:text-rumbleNone text-rumbleOutline'>The best place to find more information would either be the discord, or the white paper. You can also reach us on twitter.</p>
          <ol className='mb-8 dark:text-rumbleNone text-rumbleOutline'>
            <li>Discord Link: <a rel="noreferrer noopener" target="_blank" href={DISCORD_LINK} className="uppercase dark:text-rumbleSecondary text-rumblePrimary">here</a></li>
            {/* <li>White Paper Link: <a rel="noreferrer noopener" target="_blank" href={WHITE_PAPER_GIST} className="uppercase dark:text-rumbleSecondary text-rumblePrimary">here</a></li> */}
            <li>Twitter: <a rel="noreferrer noopener" target="_blank" href={TWITTER_LINK} className="uppercase dark:text-rumbleSecondary text-rumblePrimary">{TWITTER_HANDLE}</a></li>
          </ol>
        </section>
      </div>
    </div>
  )
}