import { SupabaseUserType } from '@rumble-raffle-dao/types';

import supabase from '../../../client';
// idk fun to have a fake name instead of not.

export default async function usersHandler(req, res) {
  if (req.method === 'POST') {
    const { public_address } = req?.query;
    const { name } = JSON.parse(req?.body);
    const trimmedName = name.trim();
    
    const { data, error } = await supabase.from<SupabaseUserType>('users').update({ name: trimmedName }).eq('public_address', public_address);
    console.log(error);
    if (error) {
      if (error.code === '23505') {
        res.status(401).json({ error: 'Name already taken.' })
        return;
      }
      res.status(401).json({ error: 'Something went wrong in creating the user.' })
    }
    res.status(200).json(data[0]);
  } else {
    const { public_address } = req?.query;
    const { data, error } = await supabase.from<SupabaseUserType>('users').select('public_address, name').eq('public_address', public_address);
    
    if (error) {
      res.status(401).json({ error: 'Something went wrong in creating the user.' })
    }
    res.status(200).json(data[0]);
  }
}