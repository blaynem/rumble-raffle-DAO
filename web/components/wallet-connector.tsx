import React, { useEffect, useState } from 'react'
import { useAccount, useConnect, useSignMessage } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { verifyMessage } from 'ethers'
import { useUser } from '../containers/userHook'
import WalletAddress from './wallet-address'
import { LOGIN_MESSAGE } from '@rumble-raffle-dao/types/constants'

const WalletConnector = () => {
  const [loading, setLoading] = useState(false)
  const { doAuth, user } = useUser()

  // const { signMessage } = useSignMessage({
  //   message: LOGIN_MESSAGE,
  //   onSuccess: async (signature, variables) => {
  //     setLoading(true)
  //     // Verify signature when sign message succeeds
  //     const public_address = verifyMessage(variables.message, signature)
  //     await doAuth({ public_address, signature })
  //     setLoading(loading)
  //   }
  // })
  const { isConnected } = useAccount()
  const { connect } = useConnect({
    connector: new InjectedConnector()
  })

  const handleConnect = async () => {
    // connects with the first connector, which is metamask
    connect()
    // signMessage()
  }

  // If user is already logged in (via cookie) we make sure to do the auth and connect to metamask.
  // useEffect(() => {
  //   if (user?.id && user?.signature) {
  //     setLoading(true)
  //     !isConnected && connect()
  //     doAuth({ public_address: user.id, signature: user.signature })
  //     setLoading(loading)
  //   }
  // }, [user?.id])

  return (
    <div>
      {!isConnected && <span onClick={handleConnect}>Connect Metamask</span>}

      {isConnected &&
        (user?.id ? (
          <WalletAddress address={user.id} />
        ) : (
          <span onClick={() => console.log('signMessage()')}>
            {loading ? 'Loading...' : 'Sign Message'}
          </span>
        ))}
    </div>
  )
}

export default WalletConnector
