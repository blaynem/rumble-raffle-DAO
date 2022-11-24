import { React, Fragment, useState, useEffect } from 'react'
import { Menu, Popover, Transition } from '@headlessui/react'
import WalletConnector from './wallet-connector'
import { useUser } from '../containers/userHook'
import { usePreferences } from '../containers/preferences'
import EmojiEventsOutlinedIcon from '@mui/icons-material/ContrastOutlined';
import { DEFAULT_ROOM_URL, WHITE_PAPER_GIST } from '@rumble-raffle-dao/types/constants'
import { useRouter } from 'next/router'
import { useDisconnect } from 'wagmi'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const Nav = () => {
  const router = useRouter();
  // const { logout } = useUser()
  const { preferences, setDarkmode } = usePreferences();
  const [darkMode, setDarkMode] = useState(false);
  // const { disconnect } = useDisconnect()

  useEffect(() => {
    setDarkMode(preferences?.darkMode);
  }, [preferences?.darkMode]);

  const navigation = [
    { name: 'Home', href: '/' },
    // { name: 'Play', href: DEFAULT_ROOM_URL },
  ]

  const dropdownNavigation = [
    // { name: 'Settings', onClick: () => router.push('/settings') },
    // {
    //   name: 'Sign out', onClick: () => {
    //     disconnect();
    //     logout()
    //   }
    // }
  ]

  return (
    <div className={`${darkMode ? 'dark' : 'light'}`}>
      <Popover
        as="header"
        className={({ open }) =>
          classNames(
            open ? 'fixed inset-0 z-40 overflow-y-auto' : '',
            'dark:bg-black bg-rumbleBgLight border-b-2 dark:border-rumbleNone border-rumbleOutline lg:static lg:overflow-y-visible'
          )
        }
      >
        {({ open }) => (
          <>
            <div className="max-w-full mx-auto flex items-center justify-between">
              <div className="flex md:ml-8 sm:ml-2">
                {navigation.map(item => (
                  <button
                    onClick={() => router.push(item.href)}
                    key={item.name}
                    href={item.href}
                    className='px-4 py-2 uppercase hover:bg-gray-200 font-medium text-xl dark:text-rumbleNone text-rumbleOutline'
                  >
                    {item.name}
                  </button>
                ))}
              </div>
              <p className='px-4 py-2 uppercase font-medium text-xl dark:text-rumbleNone text-rumbleOutline'>
                <span className="dark:text-rumbleSecondary text-rumblePrimary">((</span>
                Beta
                <span className="dark:text-rumbleSecondary text-rumblePrimary">))</span>
              </p>
              {/* Profile dropdown */}
              <Menu as="div" className="relative">
                <div>
                  <button onClick={setDarkmode} className='mr-6'>
                    <EmojiEventsOutlinedIcon className='dark:fill-rumbleBgLight fill-rumbleBgDark' />
                  </button>
                  {/* <Menu.Button className="dark:bg-rumbleSecondary bg-rumblePrimary text-rumbleNone border-l-2 dark:border-rumbleNone border-rumbleOutline px-6 py-4 focus:outline-none focus:ring-2 focus:ring-rumbleSecondary">
                    <span className="sr-only">Open user menu</span>
                    <WalletConnector />
                  </Menu.Button> */}
                </div>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="bg-rumbleBgLight text-rumbleOutline origin-top-right absolute mt-0.5 z-10 right-0 w-48 shadow-lg ring-2 ring-rumbleOutline focus:outline-none">
                    <Menu.Item>
                      <a target="_blank" rel="noreferrer noopener" href={WHITE_PAPER_GIST}>
                        <button className='hover:bg-gray-200 text-left w-full py-2 px-4 text-sm text-gray-700 cursor-pointer'>
                          White Paper
                        </button>
                      </a>
                    </Menu.Item>
                    {dropdownNavigation.map(item => (
                      <Menu.Item key={item.name}>
                        {({ active }) => (
                          <button
                            onClick={item.onClick}
                            href={item.href}
                            className={classNames(
                              active ? 'bg-gray-200 cursor-pointer' : '',
                              'text-left w-full py-2 px-4 text-sm text-gray-700 cursor-pointer'
                            )}
                          >
                            {item.name}
                          </button>
                        )}
                      </Menu.Item>
                    ))}
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </>
        )}
      </Popover>
    </div>
  )
}

export default Nav