import { definitions } from "./supabase";

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

/**
 * Contract information from the polygon net
 */
export type GetPolyContractReturnType = {
  // Contract Tokens chain id
  chain_id: number;
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

// Used for creating rooms
export interface CreateRoomValues {
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
  user: Pick<Prisma.UsersGroupByOutputType, 'id' | 'name' | 'is_admin' | 'nonce'>
  slug: string,
}

// Used to pick the name, nonce, and public_address
export type SupabaseUserType = Pick<definitions['users'], 'name' | 'nonce' | 'public_address' | 'is_admin'>