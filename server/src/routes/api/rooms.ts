import express from 'express';
import bodyParser from 'body-parser';
import { RoomDataType } from '@rumble-raffle-dao/types';
import { addNewRoomToMemory } from '../../helpers/roomRumbleData';
import { getGameDataFromDb } from '../../helpers/getGameDataFromDb';
import prisma from '../../client-temp';

const router = express.Router();
const jsonParser = bodyParser.json()

/**
 * Flow of creating a room
 * - Create `room_params` entry
 * - Create `room` entry
 */
router.post('/create', jsonParser, async (req: any, res: any) => {
  try {
    const { contract, user, ...restReqBody } = req.body;
    const userData = await prisma.users.findUnique({ where: { id: user.id } })
    // If they aren't an admin, we say no.
    if (!userData?.is_admin) {
      res.status(401).json({ error: 'Only admin may create rooms at this time.' })
      return;
    }
    const contract_id = contract.contract_address;
    const created_by = user.id;

    const paramsBody = {
      ...restReqBody,
      created_by,
      contract_id
    }
    // Insert room_param
    const data = await prisma.rooms.upsert({
      where: { slug: restReqBody.slug },
      // If a room with the given slug hasn't been created, we create the room + the RoomParams as well
      create: {
        slug: restReqBody.slug,
        Params: {
          create: paramsBody
        }
      },
      // If the room has been created already, then we are creating a new RoomParams to use
      update: {
        Params: {
          create: paramsBody
        }
      }
    })
    // If room is created, we add it to memory.
    const roomData: RoomDataType = {
      created_by,
      contract: contract,
      gameData: null,
      game_completed: false,
      game_started: false,
      id: data.id,
      params: paramsBody,
      players: [],
      slug: restReqBody.slug,
    };
    addNewRoomToMemory(roomData);
    res.json({ data });
  } catch (error) {
    console.error('Server: /rooms/create', error);
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