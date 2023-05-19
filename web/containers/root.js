import { UserProvider } from './userHook'
import { PreferencesProvider } from './preferences'
import { AppProvider } from './app'
import React from 'react'
// import { WagmiConfig } from 'wagmi'
// import { wagmiConfig } from '../lib/wagmi-config'

function ContainerRoot({ children }) {
  return (
    <AppProvider>
      <PreferencesProvider>
        <UserProvider>
          {/* <WagmiConfig client={wagmiConfig}> */}
          {children}
          {/* </WagmiConfig> */}
        </UserProvider>
      </PreferencesProvider>
    </AppProvider>
  )
}

export default ContainerRoot
