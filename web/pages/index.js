import Head from 'next/head'
import { withSessionSsr } from '../lib/with-session'
import { usePreferences } from '../containers/preferences';
import { useEffect, useState } from 'react';
import Link from 'next/link'

/**
 * TODO:
 * - Better error handling on client side so when errors happen we don't blow up the app.
 */

const pageTitle = `Rumble Raffle DAO`
export default function PageIndex(props) {
  const { preferences } = usePreferences();
  
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
        <h1 className='uppercase font-medium mt-6 mb-12 text-2xl text-center dark:text-rumbleNone text-rumbleOutline'>Welcome to Rumble Raffle!</h1>
        <DisplayRooms />
      </div>
    </div>
  )
}

const DisplayRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [roomsError, setRoomsError] = useState(null);

  useEffect(async () => {
    const { data, error } = await fetch('/api/availablerooms').then(res => res.json());
    if (error) {
      setRoomsError('Unable to fetch rooms.');
      setRooms([]);
      return;
    }
    setRoomsError(null);
    setRooms(data);
  }, []);
  return (
    <div className="mb-8 w-80 p-6 border-2 dark:border-rumbleNone border-rumbleOutline">
      <div className="flex mb-2">
        <div className="mr-2 dark:text-rumbleSecondary text-rumblePrimary uppercase text-lg font-medium leading-7">Available Rooms:</div>
        <div className="dark:text-rumbleNone uppercase text-lg font-medium leading-7">{rooms.length}</div>
      </div>
      <ul>
        {rooms.map(room => (
          <li key={room.id} className="mb-2 dark:text-rumbleNone text-rumbleOutline text-base font-normal opacity-60 grid grid-cols-2 gap-2">
            <Link href={`/room/${room?.params?.slug}`}>
              <a className='truncate'>{room?.params?.slug}</a>
            </Link>
            <div>{room?.params?.entry_fee} {room?.params?.contract.symbol}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export const getServerSideProps = withSessionSsr(({ req }) => {
  const user = req?.session?.user
  return {
    props: {
      ...(user && { user })
    }
  }
})