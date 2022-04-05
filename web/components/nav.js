import { React, Fragment, useState, useEffect } from 'react'
import { Menu, Popover, Transition } from '@headlessui/react'
import WalletConnector from './wallet-connector'
import { useWallet } from '../containers/wallet'
import { usePreferences } from '../containers/preferences'
import WalletAddress from './wallet-address'
import EmojiEventsOutlinedIcon from '@mui/icons-material/ContrastOutlined';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const Nav = () => {
  const { user, logout } = useWallet()
  const { preferences, setDarkmode } = usePreferences();

  const userNavigation = [
    // { name: 'Settings', href: '/settings' },
    { name: 'Sign out', onClick: () => logout() }
  ]

  return (
    <div className={`${preferences?.darkMode ? 'dark' : 'light'}`}>
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
            <div className="max-w-full mx-auto flex items-center justify-end">
              {/* Profile dropdown */}
              <Menu as="div" className="relative">
                <div>
                  <button onClick={setDarkmode} className='mr-6'>
                    <EmojiEventsOutlinedIcon className='dark:fill-rumbleBgLight fill-rumbleBgDark' />
                  </button>
                  <Menu.Button className="dark:bg-rumbleSecondary bg-rumblePrimary text-rumbleNone border-l-2 dark:border-rumbleNone border-rumbleOutline px-6 py-4 focus:outline-none focus:ring-2 focus:ring-rumbleSecondary">
                    <span className="sr-only">Open user menu</span>
                    {!user && <WalletConnector />}
                    {user && <WalletAddress address={user.public_address} />}
                  </Menu.Button>
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
                  <Menu.Items className="bg-rumbleBgLight text-rumbleOutline origin-top-right absolute mt-0.5 z-10 right-0 w-48 shadow-lg ring-2 ring-rumbleOutline py-1 focus:outline-none">
                    {userNavigation.map(item => (
                      <Menu.Item key={item.name}>
                        {({ active }) => (
                          <a
                            {...(true && { onClick: item.onClick })}
                            href={item.href}
                            className={classNames(
                              active ? 'bg-gray-100' : '',
                              'block py-2 px-4 text-sm text-gray-700'
                            )}
                          >
                            {item.name}
                          </a>
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