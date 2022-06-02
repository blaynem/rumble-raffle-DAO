import { FetchContractReturnType, PolygonscanResponseType } from "@rumble-raffle-dao/types";
// import { Prisma } from '.prisma/client';
// import { ethers } from 'ethers';
// import Web3 from 'web3'

// let RaffleSmartContracts;
// if (process.env.NODE_ENV === 'development') {
//   import('@rumble-raffle-dao/smart-contracts').then(module => RaffleSmartContracts = module);
// }

/**
 * Get the abi or sourceCode from a contract.
 * @returns 
 */
 export const fetchPolygonContractABI = async (contractAddress: string): Promise<FetchContractReturnType> => {
  const data: PolygonscanResponseType = await fetch(`https://api.polygonscan.com/api?module=contract&action=getabi&address=${contractAddress}&apikey=${process.env.POLYGONSCAN_API_KEY}`)
    .then(res => res.json());
  let contractABI: any;
  try {
    contractABI = JSON.parse(data.result);
  } catch (err) {
    return { ...data, error: data.result, contractABI: null }
  }
  return { ...data, contractABI };
}

/**
 * BELOW ARE CONTRACT HELPERS NOT CURRENTLY IN USE.
 */

// const createEthereumContract = (address, abi) => {
//   const provider = new ethers.providers.Web3Provider((window as any).ethereum);
//   const signer = provider.getSigner();
//   const transactionsContract = new ethers.Contract(address, abi, signer);
//   // console.log('---createEthereumContract', transactionsContract);

//   return transactionsContract;
// };

// const getContractDetails = async (contractDetails: Pick<Prisma.ContractsGroupByOutputType, 'chain_id' | 'contract_address'>) => {
//   let rumbleContractAddress = process.env.RUMBLE_CONTRACT_ADDRESS;
//   let rumbleContract;
//   let tokenContract;
//   let tokenAddress;
//   if (process.env.NODE_ENV === 'development') {
//     // Need the decimal value to get correct payment amount.
//     // convert from bigint by doing  `number => ethers.utils.formatUnits(amt, decimals)`
//     rumbleContract = createEthereumContract(rumbleContractAddress, RaffleSmartContracts.RumbleRaffle.abi);
//     tokenAddress = contractDetails.contract_address;
//     let tokenAbi = RaffleSmartContracts.TestToken.abi;
//     // If the token isn't the test token, we fetch the abi.
//     if (tokenAddress !== process.env.DEV_TOKEN_CONTRACT_ADDRESS) {
//       tokenAbi = await (await fetchPolygonContractABI(tokenAddress)).contractABI;
//     }
//     tokenContract = createEthereumContract(tokenAddress, tokenAbi);
//   }
//   if (process.env.NODE_ENV === 'production') {
//     await checkChain(Web3.utils.toHex(contractDetails.chain_id));
//     // Contract info
//     const rumbleContractAbi = await fetchPolygonContractABI(rumbleContractAddress);
//     rumbleContract = createEthereumContract(rumbleContractAddress, rumbleContractAbi.contractABI);
//     // Token info
//     tokenAddress = contractDetails.contract_address
//     const tokenAbi = await fetchPolygonContractABI(tokenAddress);
//     tokenContract = createEthereumContract(tokenAddress, tokenAbi.contractABI);
//   }

//   console.log('Token Contract:', tokenContract);
//   let tokenDecimals: number = await tokenContract.decimals();
//   tokenDecimals.toString();

//   return {
//     tokenContract, rumbleContractAddress, rumbleContract, tokenAddress, tokenDecimals
//   }
// }

// const checkChain = async (chainId) => {
//   console.log({ chainId });
//   try {
//     await (window as any).ethereum.request({
//       method: 'wallet_switchEthereumChain',
//       params: [{ chainId: chainId }],
//     });
//   } catch (switchError) {
//     console.log('--switchError', switchError);
//     // This error code indicates that the chain has not been added to MetaMask.
//     // if (switchError.code === 4902) {
//     //   try {
//     //     await (window as any).ethereum.request({
//     //       method: 'wallet_addEthereumChain',
//     //       params: [
//     //         {
//     //           chainId,
//     //           chainName: '...',
//     //           rpcUrls: ['https://...'] /* ... */,
//     //         },
//     //       ],
//     //     });
//     //   } catch (addError) {
//     //     // handle "add" error
//     //   }
//     // }
//     // handle other "switch" errors
//   }
// }

// const payEntryFee = async (contractDetails: PlayerAndRoomInfoType['roomInfo']['contract'], amount: string): Promise<{ paid: boolean; error: any; }> => {
//   if (amount === "0") {
//     return { paid: true, error: null }
//   }
//   try {
//     if ((window as any).ethereum) {
//       const { rumbleContract, rumbleContractAddress, tokenAddress, tokenContract, tokenDecimals } = await getContractDetails(contractDetails);

//       // // Todo: Check how much we are approved to take. If it's enough, we take that.
//       // // If not, we ask them to approve x amount.

//       const data = await tokenContract.approve(rumbleContractAddress, (ethers.utils.parseUnits(amount, tokenDecimals)));
//       console.log('---Approve token data:', data);

//       const paidData = await rumbleContract.payEntryFee(tokenAddress, ethers.utils.parseUnits(amount, tokenDecimals));
//       console.log('--Pay Entry Fee', paidData);

//       const blockConfirmed = await paidData.wait();
//       console.log('---Pay Entry Fee Block Confirmed', blockConfirmed);

//       return { paid: true, error: null }
//     } else {
//       window.alert('Please install MetaMask first.')
//     }
//   } catch (error) {
//     console.error('payEntryFee', error);
//     return { paid: false, error: 'Please make sure accept both the approve tx, and the entry fee tx.' }
//   }
// }


// const payWinners = async (contractDetails: Pick<Prisma.ContractsGroupByOutputType, 'chain_id' | 'contract_address'>, payments: {
//   public_address: string;
//   amount: string;
//   token_address: string;
// }[]) => {
//   const { rumbleContract, tokenAddress, tokenDecimals } = await getContractDetails(contractDetails);
//   const _paymentAddrs = payments.map(payment => payment.public_address);
//   // Make sure payments are parsed into big numbers
//   const _paymentAmts = payments.map(payment => ethers.utils.parseUnits(payment.amount, tokenDecimals));
//   try {
//     const balance = await rumbleContract.getAllTokenBalances();
//     console.log('--balance before:', ethers.utils.formatUnits(balance[0][3], tokenDecimals));
//     const paidData = await rumbleContract.payoutPrizes(_paymentAddrs, _paymentAmts, tokenAddress);
//     console.log('--paidData', paidData);

//     const info = await paidData.wait();
//     console.log('--info-wait', info);
//     info.events.forEach(element => {
//       if (element.args) {
//         console.log('--args', ethers.utils.formatUnits(element.args[2], tokenDecimals));
//       }
//     });
//   } catch (err) {
//     console.error('payWinners', err);
//   }

// }