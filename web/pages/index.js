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
  const [availableRooms, setAvailableRooms] = useState([]);
  const [pastRooms, setPastRooms] = useState([]);
  const [availableRoomsError, setAvailableRoomsError] = useState(null);
  const [pastRoomsError, setPastRoomsError] = useState(null);

  useEffect(async () => {
    const { data: availableRooms, error: availableRoomsError } = await fetch('/api/availablerooms').then(res => res.json());
    const { data: pastRooms, error: pastRoomsError } = await fetch('/api/pastrooms').then(res => res.json());

    // Past Rooms
    if (pastRoomsError) {
      setPastRoomsError('Unable to fetch availableRooms.');
      setPastRooms([]);
      return;
    }
    setPastRoomsError(null);
    setPastRooms(pastRooms);

    // Available Rooms
    if (availableRoomsError) {
      setAvailableRoomsError('Unable to fetch availableRooms.');
      setAvailableRooms([]);
      return;
    }
    setAvailableRoomsError(null);
    setAvailableRooms(availableRooms);
  }, []);

  return (
    <div>
      <div className="mb-8 w-80 p-6 border-2 dark:border-rumbleNone border-rumbleOutline">
        <div className="flex mb-2">
          <div className="mr-2 dark:text-rumbleSecondary text-rumblePrimary uppercase text-lg font-medium leading-7">Available Rooms:</div>
          <div className="dark:text-rumbleNone uppercase text-lg font-medium leading-7">{availableRooms.length}</div>
        </div>
        <ul>
          {availableRooms.map(room => (
            <li key={room.id} className="mb-2 dark:text-rumbleNone text-rumbleOutline text-base font-normal opacity-60 grid grid-cols-2 gap-2">
              <Link href={`/room/${room?.params?.slug}`}>
                <a className='truncate'>{room?.params?.slug}</a>
              </Link>
              <div>{room?.params?.entry_fee} {room?.params?.contract.symbol}</div>
            </li>
          ))}
        </ul>
      </div>
      <div className="mb-8 w-80 p-6 border-2 dark:border-rumbleNone border-rumbleOutline">
        <div className="flex mb-2">
          <div className="mr-2 dark:text-rumbleSecondary text-rumblePrimary uppercase text-lg font-medium leading-7">Completed Rooms:</div>
          <div className="dark:text-rumbleNone uppercase text-lg font-medium leading-7">{pastRooms.length}</div>
        </div>
        <ul>
          {pastRooms.map(room => (
            <li key={room.id} className="mb-2 dark:text-rumbleNone text-rumbleOutline text-base font-normal opacity-60 grid grid-cols-2 gap-2">
              <Link href={`/room/${room?.params?.slug}`}>
                <a className='truncate'>{room?.params?.slug}</a>
              </Link>
              <div>{room?.params?.entry_fee} {room?.params?.contract.symbol}</div>
            </li>
          ))}
        </ul>
      </div>
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