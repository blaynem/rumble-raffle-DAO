import { WalletProvider } from './wallet'
import { PreferencesProvider } from './preferences';
import { AppProvider } from './app'
import React from 'react'

function ContainerRoot({ children }) {
  return (
    <AppProvider>
      <PreferencesProvider>
        <WalletProvider>
          {children}
        </WalletProvider>
      </PreferencesProvider>
    </AppProvider>
  )
}

export default ContainerRoot