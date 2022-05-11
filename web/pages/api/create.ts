import { Prisma } from '.prisma/client';
import { NextApiRequest, NextApiResponse } from 'next'
import { BASE_API_URL } from '../../lib/constants';
import createRoomSchema from '../../lib/schemaValidations/createRoom';

interface CreateRoom {
  slug: Prisma.RoomsCreateInput['slug']
  params: Omit<Prisma.RoomParamsCreateInput, 'Creator' | 'Contract'>
  contract_address: Prisma.ContractsCreateInput['contract_address']
  createdBy: Prisma.UsersCreateInput['id']
}

export default async function createRumble(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Attempt to validate the body
    await createRoomSchema.validate(req.body, { abortEarly: false })

    // Need to convert these strings to numbers.
    const { createdBy, contract_address, pve_chance, revive_chance, slug } = JSON.parse(req.body);

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
        'Content-Type': 'application/json'
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