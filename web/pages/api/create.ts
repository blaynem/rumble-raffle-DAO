import { CreateRoom } from '@rumble-raffle-dao/types';
import { NextApiRequest, NextApiResponse } from 'next'
import { BASE_API_URL } from '../../lib/constants';
import { withSessionRoute } from '../../lib/with-session';

export interface CreateRoomBody {
  slug: string;
  contract_address: string;
  createdBy: string;
  pve_chance: string;
  revive_chance: string;
}

async function createRumble(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log(req.session.user)
    // Need to convert these strings to numbers.
    const { createdBy, contract_address, pve_chance, revive_chance, slug } = JSON.parse(req.body) as CreateRoomBody;

    const createRoomObj: CreateRoom = {
      slug: slug,
      contract_address: contract_address,
      createdBy: createdBy,
      params: {
        pve_chance: parseInt(pve_chance, 10),
        revive_chance: parseInt(revive_chance, 10),
      },
    }

    const stringedBody = JSON.stringify(createRoomObj)
    // Make the fetch
    const { data, error } = await fetch(`${BASE_API_URL}/api/rooms/create`, {
      body: stringedBody,
      headers: {
        'Content-Type': 'application/json',
        signature: req.session.user.signature
      },
      method: 'POST'
    }).then(res => res.json())
    if (error) {
      res.status(400).json({ error })
      return;
    }
    res.status(200).json({ data })
  } catch (error) {
    res.status(400).json({ error })
  }
}

export default withSessionRoute(createRumble);