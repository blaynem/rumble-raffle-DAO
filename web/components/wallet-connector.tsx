import React, { useState } from 'react'
import {
  useConnect,
  useSignMessage,
} from 'wagmi'
import { verifyMessage } from 'ethers/lib/utils'
import { useUser } from '../containers/userHook';
import WalletAddress from './wallet-address'
import { LOGIN_MESSAGE } from '@rumble-raffle-dao/types/constants';

const WalletConnector = () => {
  const [loading, setLoading] = useState(false);
  const { doAuth, user } = useUser()
  
  const { signMessage } = useSignMessage({
    message: LOGIN_MESSAGE,
    onSuccess: async (signature, variables) => {
      setLoading(true);
      // Verify signature when sign message succeeds
      // TODO: Implement use of variables later for signatures
      const public_address = verifyMessage(variables.message, signature)
      await doAuth({ public_address, signature })
      setLoading(loading);
    },
  })
  const { connect, connectors, isConnected } = useConnect({
    onConnect: () => signMessage()
  })

  const handleConnect = () => {
    // connects with the first connector, which is metamask
    connect(connectors[0])
  }

  return (
    <div>
      {!isConnected && <span onClick={handleConnect}>Connect Metamask</span>}

      {isConnected && (user?.id ?
        <WalletAddress address={user.id} /> :
        <span onClick={() => signMessage()}>{loading ? 'Loading...' : 'Sign Message'}</span>
      )
      }
    </div>
  )
}

export default WalletConnector;