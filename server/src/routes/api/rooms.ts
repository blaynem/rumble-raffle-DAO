import express from 'express';
import bodyParser from 'body-parser';
import { getGameDataFromDb } from '../../helpers/getGameDataFromDb';
import prisma from '../../client';
import { Prisma } from '.prisma/client';
import { addNewRoomToMemory } from '../../helpers/roomRumbleData';
import { RoomDataType } from '@rumble-raffle-dao/types';

const router = express.Router();
const jsonParser = bodyParser.json()

// {
// 	"createdBy": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
// 	"params": {
// 		"pve_chance": 12,
// 		"revive_chance": 3
// 	},
// 	"slug": "TestRoom",
// 	"contract_address": "0x8f06208951E202d30769f50FAec22AEeC7621BE2"
// }

interface CreateRoom {
  slug: Prisma.RoomsCreateInput['slug']
  params: Omit<Prisma.RoomParamsCreateInput, 'Creator' | 'Contract'>
  contract_address: Prisma.ContractsCreateInput['contract_address']
  createdBy: Prisma.UsersCreateInput['id']
}

interface RequestBody extends express.Request {
  body: CreateRoom
}

/**
 * Flow of creating a room
 * - Create `room_params` entry
 * - Create `room` entry
 */
router.post('/create', jsonParser, async (req: RequestBody, res: express.Response) => {
  try {
    const { slug, params, contract_address, createdBy } = req.body;
    const userData = await prisma.users.findUnique({ where: { id: createdBy } })
    // If they aren't an admin, we say no.
    if (!userData?.is_admin) {
      res.status(401).json({ error: 'Only admin may create rooms at this time.' })
      return;
    }

    const dataToChange = {
      Params: {
        create: {
          ...params,
          Creator: {
            connect: {
              id: createdBy
            }
          },
          Contract: {
            connect: {
              contract_address
            }
          }
        }
      }
    }
    // Difference between the `update` and `create` here is only the `slug`.
    const roomData = await prisma.rooms.upsert({
      where: {
        slug,
      },
      update: {
        ...dataToChange
      },
      create: {
        slug,
        ...dataToChange
      },
      include: {
        Params: {
          include: {
            Contract: true,
          }
        }
      }
    })

    
    const {Params: { Contract, ...restParams }, ...restRoomData } = roomData
    const mapRoomData: RoomDataType = {
      room: restRoomData,
      params: restParams,
      contract: Contract,
      players: [],
      gameData: null,
      gameLogs: []
    }

    addNewRoomToMemory(mapRoomData);
    res.json({ data: roomData });
  } catch (error) {
    console.error('Server: /rooms/create', error);
    res.status(400).json({ error: 'Something went wrong when creating the room.' })
  }
})

/**
 * Gets the room data from the slug
 */
router.get('/:slug', async (req: any, res: any) => {
  const slug = req.params.slug;
  try {
    const { data, error } = await getGameDataFromDb(slug);

    res.json({ data, error });
  } catch (error) {
    console.error('Server: Fetch by slug', error);
    res.json({ error, data: [] });
  }
})

module.exports = router;