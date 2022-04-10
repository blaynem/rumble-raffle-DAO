import React from 'react'
import { useWallet } from '../containers/wallet'

const WalletConnector = () => {
  const { doAuth } = useWallet()
  const handleClick = () => {
    doAuth()
  }
  return <span onClick={handleClick}>Connect Metamask</span>
}

export default WalletConnector