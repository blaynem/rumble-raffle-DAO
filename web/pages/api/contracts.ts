import Web3 from 'web3'

const ALCHEMY_BASE_URL_POLYGON = 'https://polygon-mainnet.g.alchemy.com/v2';
const NETWORK_NAME_POLYGON = 'polygon';

type PolygonscanResponseType = {
  status: string;
  message: string;
  result: any;
}

type FetchContractReturnType = {
  status: string;
  message: string;
  result: any;
  contractABI: any;
  error?: any;
}

/**
 * Contract information from the polygon net
 */
export type GetPolyContractReturnType = {
  // Contract Token Address
  contract_address: string;
  // Contract Token Decimals
  decimals: string;
  // Contract Token Name
  name: string;
  // Contract Token Symbol
  symbol: string;
  error?: any;
}

/**
 * Get the abi or sourceCode from a contract.
 * @returns 
 */
const fetchContractABI = async (contractAddress: string): Promise<FetchContractReturnType> => {
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
 * Using the contractAddress, gets data of the contract.
 * @param contract_address - contract address string
 * @returns { symbol, name, decimals, methods: contract.methods }
 */
const getPolygonContractData = async (contract_address: string): Promise<GetPolyContractReturnType> => {
  try {
    const data = await fetchContractABI(contract_address);
    const web3 = new Web3(new Web3.providers.HttpProvider(`${ALCHEMY_BASE_URL_POLYGON}/${process.env.ALCHEMY_API_KEY_POLYGON}`))

    const contract = new web3.eth.Contract(data.contractABI, contract_address);

    const symbol = await contract.methods.symbol().call();
    const name = await contract.methods.name().call();
    const decimals = await contract.methods.decimals().call();

    return {
      contract_address,
      decimals,
      name,
      symbol,
    }

  } catch (error) {
    // Return with the error I guess?
    return {
      contract_address: '',
      decimals: '',
      name: '',
      symbol: '',
      error,
    }
  }
}

export default async function getContractsData(
  req: { query: { contract_address: string; network_name: string; } },
  res
) {
  const { contract_address, network_name } = req.query;
  if (!contract_address || !network_name) {
    res.status(401).json({ error: 'contract_address and network_name are required' })
  }
  if (network_name.toLowerCase() === NETWORK_NAME_POLYGON) {
    try {
      // Attempt to fetch from our own db
      const { data: [contractData], error } = await fetch(`http://localhost:3001/api/contracts/${contract_address}`)
        .then(res => res.json());
      if (error) {
        res.status(401).json({ error })
        return;
      }
      if (contractData) {
        res.status(200).json({ data: contractData });
        return;
      }
      // If it's not in our own db, we fetch it from polygonscan api
      const polygonScanData = await getPolygonContractData(contract_address);

      // If there are errors, we don't go anywhere else
      if (polygonScanData.error) {
        res.status(401).json({ error: 'There was an error processing this contract.' })
        return;
      }

      const postBody = {
        ...polygonScanData,
        network_name,
      }
      // We attempt to save it in our db.
      const data = await fetch(`http://localhost:3001/api/contracts/${contract_address}`, {
        body: JSON.stringify(postBody),
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'POST'
      }).then(res => res.json())

      // We can send back the postBody because it came directly from the polygonscan api.
      // And we don't necessarily care if it saves in our db, it's just a nice to have for later.
      res.status(200).json({ data: postBody })
    } catch (error) {
      console.error('--err', error);
      res.status(401).json({ error: `Something went wrong with the request.` })
    }
  }
}