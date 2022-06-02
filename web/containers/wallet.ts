import { createContainer } from 'unstated-next'
import { authenticate } from '../lib/wallet'
import { IronSessionUserData } from '@rumble-raffle-dao/types'

import useSWR from 'swr'


const useContainer = () => {
  const { data: user, mutate: mutateUser } = useSWR<IronSessionUserData>('/api/auth/user')

  const updateName = (name: string) => {
    mutateUser();
  }

  const logout = async () => {
    await fetch(`/api/auth/logout`);
    mutateUser();
  }

  const doAuth = () => {
    authenticate((userCookie) => {
      // If there's an error, let's display it.
      if (userCookie?.error) {
        window.alert(userCookie?.error);
        return;
      }
      mutateUser();
    })
  }

  return { doAuth, user, logout, updateName }
}

const myContainer = createContainer(useContainer)
const useWallet = myContainer.useContainer
const WalletProvider = myContainer.Provider

export { useWallet, WalletProvider }