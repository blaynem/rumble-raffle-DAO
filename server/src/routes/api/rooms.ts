import express from 'express';
import bodyParser from 'body-parser';
import { getGameDataFromDb } from '../../helpers/getGameDataFromDb';
import prisma from '../../client';
import { addNewRoomToMemory } from '../../helpers/roomRumbleData';
import { CreateRoom, RoomDataType } from '@rumble-raffle-dao/types';

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
    if (!createdBy) {
      throw('You must be logged in to create a room.');
    }
    const userData = await prisma.users.findUnique({ where: { id: createdBy } })
    // If they aren't an admin, we say no.
    if (!userData?.is_admin) {
      throw('Only admin may create rooms at this time.');
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
    if (typeof error === 'string') {
      res.status(400).json({ error })
      return;
    }
    if (error?.code === 'P2009') {
      res.status(400).json({ error: 'Missing a required value to create a room.' })
      return;
    }
    res.status(400).json({ error: 'Something went wrong with the request' })
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