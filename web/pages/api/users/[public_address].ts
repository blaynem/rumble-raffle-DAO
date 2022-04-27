import { NextApiRequest, NextApiResponse } from 'next'
import { SupabaseUserType } from '@rumble-raffle-dao/types';

import supabase from '../../../client';
import { withSessionRoute } from '../../../lib/with-session';

interface ExtendedNextAPIRequest extends NextApiRequest {
  query: {
    public_address: string;
  }
}

async function usersHandler(req: ExtendedNextAPIRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { public_address } = req?.query;
    const { name } = JSON.parse(req?.body);

    const trimmedName = name.trim();
    const { data, error } = await supabase.from<SupabaseUserType>('users')
      .update({ name: trimmedName })
      .eq('public_address', public_address)
      .select(`public_address, nonce, name, is_admin`);
    
    if (error) {
      if (error.code === '23505') {
        res.status(401).json({ error: 'Name already taken.' })
        return;
      }
      res.status(401).json({ error: 'Something went wrong in updating the user.' })
    }
    
    const user = data[0];
    req.session.user = user
    await req.session.save()

    res.status(200).json(user);
  } else {
    const { public_address } = req?.query;
    const { data, error } = await supabase.from<SupabaseUserType>('users').select('public_address, name').eq('public_address', public_address);
    
    if (error) {
      res.status(401).json({ error: 'Something went wrong fetching the user.' })
    }
    res.status(200).json(data[0]);
  }
}

export default withSessionRoute(usersHandler);