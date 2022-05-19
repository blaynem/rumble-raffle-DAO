import { FetchContractReturnType, PolygonscanResponseType } from "@rumble-raffle-dao/types";

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