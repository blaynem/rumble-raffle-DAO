import { UserProvider } from './userHook'
import { PreferencesProvider } from './preferences';
import { AppProvider } from './app'
import React from 'react'

function ContainerRoot({ children }) {
  return (
    <AppProvider>
      <PreferencesProvider>
        <UserProvider>
          {children}
        </UserProvider>
      </PreferencesProvider>
    </AppProvider>
  )
}

export default ContainerRoot