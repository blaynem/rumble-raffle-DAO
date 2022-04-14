import supabase from '../../client';
import { definitions, SupabaseUserType } from '@rumble-raffle-dao/types';

export default async function availablerooms(req, res) {
  const { data, error } = await supabase.from<definitions['rooms']>('rooms').select(`
    id,
    params: params_id (
      slug,
      entry_fee,
      contract: contract_id (
        contract_address, name, symbol
      )
    )
  `).eq('game_completed', false)
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