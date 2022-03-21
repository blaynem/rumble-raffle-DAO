import Web3 from 'web3'

// TODO: All the fetches should probably go server side so we don't have apikey sitting out here in the open.

type PolygonscanResponseType = {
  status: string;
  message: string;
  result: any;
}

type FetchAccountsType = {
  address: string;
  contractAddress: string;
}

type FetchBalanceReturnType = {
  status: string;
  message: string;
  /**
   * The result is returned in the token's smallest decimal representation.
   * Ex: a token with a balance of 215.241526476136819398 and 18 decimal places will be returned as 215241526476136819398
   */
  result: any;
}

/**
 * Only returns the balance of a given account address.
 * @returns - data.result will need to be divided by the decimal. Ex: data.result / 1e18
 */
export const fetchTokenBalance = async ({ address, contractAddress }: FetchAccountsType): Promise<FetchBalanceReturnType> => {
  const data: PolygonscanResponseType = await fetch(`https://api.polygonscan.com/api?module=account&action=tokenbalance&tag=latest&address=${address}&contractaddress=${contractAddress}&apikey=${process.env.POLYGONSCAN_API_KEY}`)
    .then(res => res.json())
  return data;
}


type FetchContractReturnType = {
  status: string;
  message: string;
  result: any;
  contractABI: any;
  error?: any;
}

/**
 * Get the abi or sourceCode from a contract.
 * @returns 
 */
export const fetchContractABI = async (contractAddress: string): Promise<FetchContractReturnType> => {
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

/** =====FUNCTIONS TO GET CONTRACT DATA===== */

export type GetPolyContractReturnType = {
  symbol: string;
  name: string;
  decimals: string;
  methods: any;
}

/**
 * Using the contractAddress, gets data of the contract.
 * @param contractAddress - contract address string
 * @returns { symbol, name, decimals, methods: contract.methods }
 */
export const getPolygonContractData = async (contractAddress: string): Promise<GetPolyContractReturnType> => {
  const data = await fetchContractABI(contractAddress);
  const web3 = new Web3((window as any).ethereum)

  const contract = new web3.eth.Contract(data.contractABI, contractAddress)
  const symbol = await contract.methods.symbol().call();
  const name = await contract.methods.name().call();
  const decimals = await contract.methods.decimals().call();

  return { symbol, name, decimals, methods: contract.methods }
}
