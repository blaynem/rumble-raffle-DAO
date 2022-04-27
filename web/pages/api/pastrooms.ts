import { NextApiRequest, NextApiResponse } from 'next'
import supabase from '../../client';
import { definitions } from '@rumble-raffle-dao/types';

export default async function pastrooms(req: NextApiRequest, res: NextApiResponse) {
  const { data, error } = await supabase.from<definitions['rooms']>('rooms').select(`
    id,
    params: params_id (
      slug,
      entry_fee,
      contract: contract_id (
        contract_address, name, symbol
      )
    )
  `).eq('game_completed', true)
  if (error) {
    res.status(404).json({ error })
    return;
  }
  if (data.length > 0) {
    res.status(200).json({ data, error: null })
    return;
  }
  res.status(404).json({ error: 'There are no rooms matching this slug.', data: [] })
}