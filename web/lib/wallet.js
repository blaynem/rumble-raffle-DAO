import Web3 from 'web3'
import { NONCE_MESSAGE } from './constants'

let web3 = undefined
export const getCookie = ({ publicAddress, signature }) =>
  fetch(`/api/auth`, {
    body: JSON.stringify({ publicAddress, signature }),
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST'
  }).then(response => response.json())

export const handleSignMessage = async ({ publicAddress, nonce }) => {
  console.log('--lib/wallet.js--public addy sign message biatch', publicAddress, nonce)
  try {
    const signature = await web3.eth.personal.sign(
      `${NONCE_MESSAGE}${nonce}`,
      publicAddress,
      '' // MetaMask will ignore the password argument here
    )

    return { publicAddress, signature }
  } catch (err) {
    console.log('--errr', err);
    throw new Error('You need to sign the message to be able to log in.')
  }
}

export const authenticate = async onLoggedIn => {
  // Check if MetaMask is installed
  if (!window.ethereum) {
    window.alert('Please install MetaMask first.')
    return
  }

  if (!web3) {
    try {
      // Request account access if needed
      await window.ethereum.enable()

      // We don't know window.web3 version, so we use our own instance of Web3
      // with the injected provider given by MetaMask
      web3 = new Web3(window.ethereum)
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

  /**
   * TODO:
   * - Actually make all of this go through api calls instead of not.
   */
  const publicAddress = coinbase.toLowerCase()
  fetch(`/api/users?publicAddress=${publicAddress}`)
    .then(response => response.json())
    // Popup MetaMask confirmation modal to sign message
    .then(handleSignMessage)
    // Send signature to backend on the /auth route to get cookie
    .then(getCookie)
    // Pass accessToken back to parent component (to save it in localStorage)
    .then(onLoggedIn)
    .catch(err => {
      window.alert(err)
    })
}