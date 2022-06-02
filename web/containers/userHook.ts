import { createContainer } from 'unstated-next'
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

  const doAuth = async ({ signature, public_address }: { signature: string; public_address: string; }) => {
    try {
      // call the nextjs login api
      fetch(`/api/auth/login`, {
        body: JSON.stringify({ id: public_address.toLocaleLowerCase(), signature }),
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'POST'
      }).then((userCookie: any) => {
        // If there's an error, let's display it.
        if (userCookie?.error) {
          window.alert(userCookie?.error);
          return;
        }
        mutateUser();
      }).catch(err => {
        window.alert(err)
      })
      // Call mutateUser which updates the ironSession data
      // mutateUser();
    } catch (err) {
      console.error("authenticate error", err)
    }
    return { loading: false }
  }

  return { doAuth, user, logout, updateName }
}

const myContainer = createContainer(useContainer)
const useUser = myContainer.useContainer
const UserProvider = myContainer.Provider

export { useUser, UserProvider }