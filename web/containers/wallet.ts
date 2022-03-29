import { useState } from 'react'
import { createContainer } from 'unstated-next'
import { authenticate } from '../lib/wallet'
import { useLocalStorage } from '../lib/localstorage'
import { PlayerAndPrizeSplitType, SupabaseUserType } from '@rumble-raffle-dao/types'
import { ethers } from 'ethers';

import { RumbleRaffle, TestToken } from '@rumble-raffle-dao/smart-contracts';
import Web3 from 'web3'
import { fetchPolygonContractABI } from '../pages/api/contracts'

const createEthereumContract = (address, abi) => {
  const provider = new ethers.providers.Web3Provider((window as any).ethereum);
  const signer = provider.getSigner();
  const transactionsContract = new ethers.Contract(address, abi, signer);
  // console.log('---createEthereumContract', transactionsContract);

  return transactionsContract;
};

const checkChain = async (chainId) => {
  console.log({chainId});
  try {
    await (window as any).ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainId }],
    });
  } catch (switchError) {
    console.log('--switchError', switchError);
    // This error code indicates that the chain has not been added to MetaMask.
    // if (switchError.code === 4902) {
    //   try {
    //     await (window as any).ethereum.request({
    //       method: 'wallet_addEthereumChain',
    //       params: [
    //         {
    //           chainId,
    //           chainName: '...',
    //           rpcUrls: ['https://...'] /* ... */,
    //         },
    //       ],
    //     });
    //   } catch (addError) {
    //     // handle "add" error
    //   }
    // }
    // handle other "switch" errors
  }
}

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

  const payEntryFee = async (contractDetails: PlayerAndPrizeSplitType['roomInfo']['contract'], amount: string): Promise<{ paid: boolean; error: any; }> => {
    try {
      if ((window as any).ethereum) {
        let rumbleContractAddress = process.env.RUMBLE_CONTRACT_ADDRESS;
        let rumbleContract;
        let tokenContract;
        let tokenAddress;
        console.log(process.env.DEV_TOKEN_CONTRACT_ADDRESS);
        if (process.env.NODE_ENV === 'development') {
          // Need the decimal value to get correct payment amount.
          // convert from bigint by doing  `number => ethers.utils.formatUnits(amt, decimals)`
          rumbleContract = createEthereumContract(rumbleContractAddress, RumbleRaffle.abi);
          tokenAddress = process.env.DEV_TOKEN_CONTRACT_ADDRESS;
          tokenContract = createEthereumContract(tokenAddress, TestToken.abi);
        }
        if (process.env.NODE_ENV === 'production') {
          // todo: Enable check chain for non-localhost
          await checkChain(Web3.utils.toHex(contractDetails.chain_id));
          // Contract info
          const rumbleContractAbi = await fetchPolygonContractABI(rumbleContractAddress);
          rumbleContract = createEthereumContract(rumbleContractAddress, rumbleContractAbi.contractABI);
          // Token info
          tokenAddress = contractDetails.contract_address
          const tokenAbi = await fetchPolygonContractABI(tokenAddress);
          tokenContract = createEthereumContract(tokenAddress, tokenAbi.contractABI);
        }

        let tokenDecimals: number = await tokenContract.decimals();
        tokenDecimals.toString();
        // // Todo: Check how much we are approved to take. If it's enough, we take that.
        // // If not, we ask them to approve x amount.

        const data = await tokenContract.approve(rumbleContractAddress, (ethers.utils.parseUnits(amount, tokenDecimals)));
        // console.log('---data', data);

        const paidData = await rumbleContract.payEntryFee(tokenAddress, ethers.utils.parseUnits(amount, tokenDecimals));
        // console.log('--paidData', paidData);

        await paidData.wait();

        return { paid: true, error: null }
      } else {
        window.alert('Please install MetaMask first.')
      }
    } catch (error) {
      console.error('payEntryFee', error);
      return { paid: false, error: 'Please make sure accept both the approve tx, and the entry fee tx.' }
    }
  }

  return { payEntryFee, doAuth, user }
}
const myContainer = createContainer(useContainer)
const useWallet = myContainer.useContainer
const WalletProvider = myContainer.Provider

export { useWallet, WalletProvider }