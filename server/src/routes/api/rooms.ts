import express from 'express';
import bodyParser from 'body-parser';
import { getGameDataFromDb } from '../../helpers/getGameDataFromDb';
import prisma from '../../client';
import availableRoomsData, { addNewRoomToMemory } from '../../helpers/roomRumbleData';
import { CreateRoom, RoomDataType } from '@rumble-raffle-dao/types';
import verifySignature from '../../utils/verifySignature';
import { GAME_START_COUNTDOWN, LOGIN_MESSAGE, NEW_GAME_CREATED } from '@rumble-raffle-dao/types/constants';
import { io } from '../../sockets';
import { startRumble } from '../../helpers/startRumble';
import { dripGameDataOnDelay } from '../../sockets/startGame';

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
  body: CreateRoom & { discord_id?: string; }
}

interface StartRequest extends express.Request {
  body: {
    discord_id: string;
    roomSlug: string;
  }
}

router.post('/start', jsonParser, async (req: StartRequest, res: express.Response) => {
  try {
    const { discord_id, roomSlug } = req.body;
    const { roomData, gameState } = availableRoomsData[roomSlug];

    // Check if they're an admin.
    const userData = await prisma.users.findFirst({
      where: { discord_id },
      select: { is_admin: true, id: true }
    })


    // If they aren't an admin, we do nothing.
    if (!userData?.is_admin) {
      throw ('Only admins can start games.')
    }

    // Only let the room owner start the game.
    if (userData?.id !== roomData?.params?.created_by) {
      console.warn(`${userData?.id} tried to start a game they are not the owner of.`);
      throw (`${userData?.id} tried to start a game they are not the owner of.`)
    }

    const gameData = await startRumble(roomSlug);
    roomData.gameData = gameData;
    // Set the local game start state to true.
    roomData.params.game_started = true;
    // Start emitting the game events to the players on a delay.
    dripGameDataOnDelay(io, roomSlug);
    io.in(roomSlug).emit(GAME_START_COUNTDOWN, gameState.waitTime);
    res.status(400).json({ data: 'Game started successfully.' })
  } catch (err) {
    console.error('api/rooms/start', err)
    res.status(400).json({ data: null, error: 'There was an error when starting the game.' })
  }
})

/**
 * Flow of creating a room
 * - Create `room_params` entry
 * - Create `room` entry
 */
router.post('/create', jsonParser, async (req: RequestBody, res: express.Response) => {
  try {
    const { slug, params, contract_address, discord_id } = req.body;
    // Overwriting this if creator is from discord
    let { createdBy } = req.body;

    // TODO: FIX THIS!! This is terrible and not good authentication.. lol 
    if (discord_id) {
      const userData = await prisma.users.findFirst({ where: { discord_id } })
      // If they aren't an admin, we say no.
      if (!userData?.is_admin) {
        throw ('Only admin may create rooms at this time.');
      }

      // We overwrite createdBy to be the found user from the db.
      createdBy = userData?.id;
    } else {

      const validatedSignature = verifySignature(createdBy, req.headers.signature as string, LOGIN_MESSAGE)
      if (!validatedSignature) {
        throw new Error('Signature validation failed.');
      }

      // createdBy comes from client, but not discord
      if (!createdBy) {
        throw ('You must be logged in to create a room.');
      }

      const userData = await prisma.users.findUnique({ where: { id: createdBy } })
      // If they aren't an admin, we say no.
      if (!userData?.is_admin) {
        throw ('Only admin may create rooms at this time.');
      }
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


    const { Params: { Contract, ...restParams }, ...restRoomData } = roomData
    const mapRoomData: RoomDataType = {
      room: restRoomData,
      params: restParams,
      contract: Contract,
      players: [],
      gameData: null,
      gameLogs: []
    }

    // Emit new game created event to sockets
    io.to(slug).emit(NEW_GAME_CREATED, mapRoomData)
    // Add new room to memory
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