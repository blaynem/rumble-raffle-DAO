import React from 'react'
import { useWallet } from '../containers/wallet'

const WalletConnector = () => {
  const { doAuth } = useWallet()
  const handleClick = () => {
    doAuth()
  }
  return <button onClick={handleClick}>Connect Metamask</button>
}

export default WalletConnector