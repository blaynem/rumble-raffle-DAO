import { useState } from 'react'
import { createContainer } from 'unstated-next'
import { authenticate } from '../lib/wallet'
import { useLocalStorage } from '../lib/localstorage'
import { SupabaseUserType } from '@rumble-raffle-dao/types'

const useContainer = initialState => {
  const [localUser, setLocalUser] = useLocalStorage('user', initialState)
  const [user, setUser] = useState(localUser as SupabaseUserType)

  const doAuth = () => {
    authenticate((authResponse: SupabaseUserType) => {
      console.log('frontend user?', authResponse)
      setLocalUser(authResponse)
      setUser(authResponse)
    })
  }
  return { doAuth, user }
}
const myContainer = createContainer(useContainer)
const useWallet = myContainer.useContainer
const WalletProvider = myContainer.Provider

export { useWallet, WalletProvider }