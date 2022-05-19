import { recoverPersonalSignature } from 'eth-sig-util'
import { bufferToHex } from 'ethereumjs-util'
import Web3 from 'web3'
import { LOGIN_MESSAGE } from './constants'

let web3 = undefined

/**
 * Verify an eth signature
 */
export const verifySignature = (id: string, signature: string, message: string): boolean => {
  const msgBufferHex = bufferToHex(Buffer.from(message, 'utf8'))
  const address = recoverPersonalSignature({
    data: msgBufferHex,
    sig: signature as string,
  })
  return address.toLowerCase() === id.toLowerCase();
}

export const handleSignMessage = async ({ id, message }) => {
  try {
    web3 = new Web3((window as any).ethereum)
    const signature = await web3.eth.personal.sign(
      message,
      id,
      '' // MetaMask will ignore the password argument here
    )

    return { id, signature }
  } catch (err) {
    console.log('--errr', err);
    throw new Error('You need to sign the message to be able to log in.')
  }
}

export const authenticate = async onLoggedIn => {
  // Check if MetaMask is installed
  if (!(window as any).ethereum) {
    window.alert('Please install MetaMask first.')
    return
  }

  if (!web3) {
    try {
      // Request account access if needed
      await (window as any).ethereum.enable()

      // We don't know window.web3 version, so we use our own instance of Web3
      // with the injected provider given by MetaMask
      web3 = new Web3((window as any).ethereum)
    } catch (error) {
      window.alert('You need to allow MetaMask.')
      return
    }
  }

  const coinbase = await web3?.eth?.getCoinbase()
  if (!coinbase) {
    window.alert('Please activate MetaMask first.')
    return
  }

  const public_address = coinbase.toLowerCase()

  try {
    // Popup MetaMask confirmation modal to sign message
    const { signature } = await handleSignMessage({ id: public_address, message: LOGIN_MESSAGE })

    fetch(`/api/auth/login`, {
      body: JSON.stringify({ id: public_address, signature }),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST'
    })
      // fire the onLoggedIn callback
      .then(onLoggedIn)
      .catch(err => {
        window.alert(err)
      })
  } catch (err) {
    console.error("authenticate error", err)
  }
}