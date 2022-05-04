import Head from 'next/head'
import { usePreferences } from '../containers/preferences';


const pageTitle = `How It Works`
export default function PageIndex() {
  const { preferences } = usePreferences();

  return (
    <div>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content="How it works" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={`${preferences?.darkMode ? 'dark' : 'light'}`}>
        <div className='dark:bg-black bg-rumbleBgLight w-full mx-auto py-8 px-6 lg:px-[15%] md:px-[10%] sm:px-10 overflow-auto scrollbar-thin dark:scrollbar-thumb-rumbleSecondary scrollbar-thumb-rumblePrimary scrollbar-track-rumbleBgDark"' style={{ height: 'calc(100vh - 58px)' }}>
          <h3 className="uppercase text-2xl font-medium leading-9 dark:text-rumbleNone text-rumbleOutline">How it works</h3>
          <p className="mb-20 text-base leading-6 dark:text-rumbleNone text-rumbleOutline opacity-60">
            Some things happen and it's great!
          </p>
        </div>
      </div>
    </div>
  )
}
