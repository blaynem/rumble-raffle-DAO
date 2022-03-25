export const ALCHEMY_BASE_URL_POLYGON = 'https://polygon-mainnet.g.alchemy.com/v2';
export const NETWORK_NAME_POLYGON = 'polygon';

export type PolygonscanResponseType = {
  status: string;
  message: string;
  result: any;
}

export type FetchContractReturnType = {
  status: string;
  message: string;
  result: any;
  contractABI: any;
  error?: any;
}

export type ServerSidePropsType = {
  activeRoom: boolean;
  roomCreator: string;
  roomSlug: string;
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

export type ToastTypes = {
  type?: 'ERROR' | 'WARNING' | 'SUCCESS';
  message: string;
  onClick?: () => void;
}

export type ContractType = {
  // Ex: Polygon
  network_name: string;
} & GetPolyContractReturnType;

export interface Values {
  alt_split_address: string;
  entry_fee: string;
  contract: ContractType;
  pve_chance: string;
  revive_chance: string;
  prize_split: {
    prize_alt_split: string;
    prize_kills: string;
    prize_first: string;
    prize_second: string;
    prize_third: string;
    prize_creator: string;
  }
  user: SupabaseUserType
  slug: string,
}

export type SupabaseUserType = {
  public_address: string;
  nonce: string;
  name: string;
}