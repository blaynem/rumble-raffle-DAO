import express from 'express';
import bodyParser from 'body-parser';
import { getGameDataFromDb } from '../../helpers/getGameDataFromDb';
import prisma from '../../client';
import availableRoomsData from '../../gameState/roomRumbleData';
import { AllAvailableRoomsType, CreateRoom, IronSessionUserData, RoomDataType, StartRoomDiscordFetchBody } from '@rumble-raffle-dao/types';
import verifySignature from '../../utils/verifySignature';
import { LOGIN_MESSAGE, NEW_GAME_CREATED, UPDATE_PLAYER_LIST } from '@rumble-raffle-dao/types/constants';
import { io } from '../../sockets';
import { startGame } from '../../gameState/startGame';
import { getPlayersAndRoomInfo } from '../../helpers/getPlayersAndRoomInfo';
import { addPlayer } from '../../helpers/addPlayer';

const router = express.Router();
const jsonParser = bodyParser.json()

// {
// 	"createdBy": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
// 	"params": {
// 		"pve_chance": 12,
// 		"revive_chance": 3
// 	},
// 	"slug": "TestRoom",
// 	"contract_address": "0xe7f934c08f64413b98cab9a5bafeb1b21fcf2049"
// }

interface CreateRoomRequestBody extends express.Request {
  body: CreateRoom & { discord_id?: string; discord_secret?: string }
}

interface JoinGameRequest extends express.Request {
  body: {
    roomSlug: string;
    user: IronSessionUserData
  }
}

/**
 * User attempts to join a game via website
 */
router.post('/join', jsonParser, async (req: JoinGameRequest, res: express.Response) => {
  const { roomSlug, user } = req.body;
  try {
    // Will error if the player is already added to the game.
    const { error } = await addPlayer(roomSlug, user);

    if (error) {
      res.status(400).json({ data: null, error })
      return;
    }
    const playersAndRoomInfo = getPlayersAndRoomInfo(roomSlug);
    io.in(roomSlug).emit(UPDATE_PLAYER_LIST, playersAndRoomInfo, roomSlug);
    res.status(200).json({ data: 'You have joined the game.' })
  } catch (error) {
    // P2002 = unique constraint, i.e. they already joined
    if (error?.code === 'P2002') {
      res.status(200).json({ data: 'Player already joined.' })
      return;
    }
    console.error('Server: joinGame', error)
    res.status(400).json({ data: null, error: 'There was an error joining the game.' })
  }
});


router.post('/discord_start', jsonParser, async (req: express.Request<StartRoomDiscordFetchBody>, res: express.Response) => {
  try {
    const { discord_id, roomSlug, discord_secret, players } = req.body as StartRoomDiscordFetchBody;

    if (discord_secret !== process.env.DISCORD_SECRET_PASS) {
      throw new Error('Discord password not provided.')
    }

    // // Add the discord players to the discordPlayers array.
    const updatedRoomData: AllAvailableRoomsType = {
      ...availableRoomsData.getRoom(roomSlug),
      discordPlayers: players.map(p => ({ ...p, id_origin: 'DISCORD' })),
    }
    availableRoomsData.updateRoom(roomSlug, updatedRoomData)

    await startGame(true, roomSlug);
    res.status(400).json({ data: 'Game started successfully.' })
  } catch (err) {
    console.error('api/rooms/start', err)
    res.status(400).json({ data: null, error: 'There was an error when starting the game.' })
  }
})

interface StartRoomWebRequest extends express.Request {
  body: {
    roomSlug: string;
    user: IronSessionUserData;
  }
}

router.post('/start', jsonParser, async (req: StartRoomWebRequest, res: express.Response) => {
  try {
    const { user, roomSlug } = req.body;

    const verifiedSignature = verifySignature(user.id, user.signature, LOGIN_MESSAGE);
    if (!verifiedSignature) {
      throw new Error('Verified signature failed');
    }

    // Check if they're an admin.
    const userData = await prisma.users.findUnique({
      where: { id: user.id },
      select: { is_admin: true }
    })

    await startGame(userData.is_admin, roomSlug);
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
router.post('/create', jsonParser, async (req: CreateRoomRequestBody, res: express.Response) => {
  try {
    const { slug, params, contract_address, discord_id, discord_secret } = req.body;
    // Overwriting this if creator is from discord
    let { createdBy } = req.body;

    // If discord_id is included, then it must have the discord_secret_pass as well
    if (discord_id) {
      // We check the discord secret pass before going further.
      if (discord_secret !== process.env.DISCORD_SECRET_PASS) {
        throw new Error('Discord password not provided.')
      }
      const userData = await prisma.users.findFirst({ where: { discord_id } })
      // If they aren't an admin, we say no.
      if (!userData?.is_admin) {
        throw ('Please reach out to the Rumble Raffle admins in order to create a game.');
      }

      // We overwrite createdBy to be the found user from the db.
      createdBy = userData?.id;
    } else {
      // Otherwise we can verify the signature here.

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
              contract_address: contract_address.toLowerCase()
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
    availableRoomsData.addRoom(mapRoomData)
    res.json({ data: mapRoomData });
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