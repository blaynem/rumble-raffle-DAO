import React, { useState, useEffect } from 'react'
let Web3 = require('web3')

function WalletContract() {
  const [web3, setWeb3] = useState(null)
  const [address, setAddress] = useState(null)
  const [contract, setContract] = useState(null)
  const [myString, setMyString] = useState(0)
  let abi = [
    {
      inputs: [],
      name: 'myString',
      outputs: [
        {
          internalType: 'string',
          name: '',
          type: 'string',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
  ]

  let contractAddress = '0x4b19351eEF989ccf875cB8A95E032010E8Bc0040'

  useEffect(() => {
    window.ethereum
      ? ethereum
          .request({ method: 'eth_requestAccounts' })
          .then(accounts => {
            setAddress(accounts[0])
            let w3 = new Web3(ethereum)
            setWeb3(w3)

            let c = new w3.eth.Contract(abi, contractAddress)
            setContract(c)

            c.methods
              .myString()
              .call()
              .then(theString => {
                // Optionally set it to the state to render it using React
                setMyString(theString)
              })
              .catch(err => console.log(err))
          })
          .catch(err => console.log(err))
      : console.log('Please install MetaMask')
  }, [])
  return <div>Welcome to your homepage {myString && <div>contract returned: {myString}</div>}</div>
}

export default WalletContract