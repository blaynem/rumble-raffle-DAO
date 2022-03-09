import { WalletProvider } from './wallet'
import { AppProvider } from './app'
import React from 'react'

function ContainerRoot({ children }) {
  return (
    <AppProvider>
      <WalletProvider>{children}</WalletProvider>
    </AppProvider>
  )
}

export default ContainerRoot