import express from 'express'
import bodyParser from 'body-parser'
import { getGameDataFromDb } from '../../helpers/getGameDataFromDb'
import prisma from '../../client'
import availableRoomsData from '../../gameState/roomRumbleData'
import {
  AllAvailableRoomsType,
  CreateRoomRequestBody,
  IronSessionUserData,
  RoomDataType,
  StartRoomDiscordFetchBody
} from '@rumble-raffle-dao/types'
import verifySignature from '../../utils/verifySignature'
import {
  LOGIN_MESSAGE,
  NEW_GAME_CREATED,
  UPDATE_PLAYER_LIST
} from '@rumble-raffle-dao/types/constants'
import { io } from '../../sockets'
import { startGame } from '../../gameState/startGame'
import { getPlayersAndRoomInfo } from '../../helpers/getPlayersAndRoomInfo'
import { addPlayer } from '../../helpers/addPlayer'
import { Contracts, Prisma, RoomParams, Rooms } from '@prisma/client'
import { startGameFree } from '../../helpers/free/startGameFree'
import { getMockRoomData } from '../../helpers/free/getMockRoomData'

const router = express.Router()
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

interface JoinGameRequest extends express.Request {
  body: {
    roomSlug: string
    user: IronSessionUserData
  }
}

/**
 * User attempts to join a game via website
 */
router.post('/join', jsonParser, async (req: JoinGameRequest, res: express.Response) => {
  const { roomSlug, user } = req.body
  try {
    // Will error if the player is already added to the game.
    const { error } = await addPlayer(roomSlug, user)

    if (error) {
      res.status(400).json({ data: null, error })
      return
    }
    const playersAndRoomInfo = getPlayersAndRoomInfo(roomSlug)
    if (!playersAndRoomInfo) {
      res.status(400).json({ data: null, error: 'Room does not exist.' })
      return
    }
    io.in(roomSlug).emit(UPDATE_PLAYER_LIST, playersAndRoomInfo, roomSlug)
    res.status(200).json({ data: 'You have joined the game.' })
  } catch (error: any) {
    // P2002 = unique constraint, i.e. they already joined
    if (error?.code === 'P2002') {
      res.status(200).json({ data: 'Player already joined.' })
      return
    }
    console.error('Server: joinGame', error)
    res.status(400).json({ data: null, error: 'There was an error joining the game.' })
  }
})

router.post(
  '/discord_start',
  jsonParser,
  async (req: express.Request<StartRoomDiscordFetchBody>, res: express.Response) => {
    try {
      const { roomSlug, discord_secret, players, save_to_db } =
        req.body as StartRoomDiscordFetchBody

      if (discord_secret !== process.env.DISCORD_SECRET_PASS) {
        throw new Error('Discord password not provided.')
      }
      const currentRoomData = availableRoomsData.getRoom(roomSlug)
      if (!currentRoomData) {
        throw new Error('Room does not exist.')
      }

      // If we are NOT saving to the db, go here. This will not fire any API calls (except the response)
      if (!save_to_db) {
        // Put the discord players into the room
        const updatedRoomData: AllAvailableRoomsType = {
          ...currentRoomData,
          discordPlayers: players.map(p => ({ ...p, id_origin: 'DISCORD' }))
        }
        availableRoomsData.updateRoom(roomSlug, updatedRoomData)

        // Start the free game
        startGameFree(roomSlug)

        // Everything else goes through the sockets, so just say game started
        res.status(200).json({ data: 'Game started successfully.' })
        return
      }

      // // Add the discord players to the discordPlayers array.
      const updatedRoomData: AllAvailableRoomsType = {
        ...currentRoomData,
        discordPlayers: players.map(p => ({ ...p, id_origin: 'DISCORD' }))
      }
      availableRoomsData.updateRoom(roomSlug, updatedRoomData)

      const response = await startGame(roomSlug)
      if (response?.error) {
        throw response.error
      }

      res.status(200).json({ data: 'Game started successfully.' })
    } catch (err) {
      console.error('api/rooms/start', err)
      res.status(400).json({ data: null, error: 'There was an error when starting the game.' })
    }
  }
)

interface StartRoomWebRequest extends express.Request {
  body: {
    roomSlug: string
    user: IronSessionUserData
  }
}

router.post('/start', jsonParser, async (req: StartRoomWebRequest, res: express.Response) => {
  try {
    const { user, roomSlug } = req.body

    const verifiedSignature = verifySignature(user.id, user.signature, LOGIN_MESSAGE)
    if (!verifiedSignature) {
      throw new Error('Verified signature failed')
    }

    await startGame(roomSlug)
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
router.post(
  '/create',
  jsonParser,
  async (req: express.Request<CreateRoomRequestBody>, res: express.Response) => {
    try {
      const { slug, params, contract_address, discord_id, discord_secret, save_to_db } = req.body

      // If we don't want to save it to the db we can mock a lot!
      if (!save_to_db) {
        // We check the discord secret pass before going further.
        if (discord_secret !== process.env.DISCORD_SECRET_PASS) {
          throw new Error('Discord password not provided.')
        }

        const roomData = getMockRoomData(slug, params.pve_chance, params.revive_chance)
        // Emit new game created event to sockets
        io.to(slug).emit(NEW_GAME_CREATED, roomData)
        // Add new room to memory
        availableRoomsData.addRoom(roomData)
        res.json({ data: roomData })
        return
      }

      // Overwriting this if creator is from discord
      let { createdBy } = req.body

      // If discord_id is included, then it must have the discord_secret_pass as well
      if (discord_id) {
        // We check the discord secret pass before going further.
        if (discord_secret !== process.env.DISCORD_SECRET_PASS) {
          throw new Error('Discord password not provided.')
        }
        const userData = await prisma.users.findFirst({ where: { discord_id } })
        // We overwrite createdBy to be the found user from the db.
        createdBy = userData?.id
      } else {
        // Otherwise we can verify the signature here.

        const validatedSignature = verifySignature(
          createdBy,
          req.headers.signature as string,
          LOGIN_MESSAGE
        )
        if (!validatedSignature) {
          throw new Error('Signature validation failed.')
        }

        // createdBy comes from client, but not discord
        if (!createdBy) {
          throw Error('You must be logged in to create a room.')
        }
      }

      // If they have not linked discord to the db, then we won't have an id. So this is optional
      const roomsUpsert: Prisma.RoomsUpsertArgs = {
        where: {
          slug
        },
        update: {
          Params: {
            create: {
              pve_chance: params.pve_chance,
              revive_chance: params.revive_chance,
              ...(createdBy && {
                Creator: {
                  connect: {
                    id: createdBy
                  }
                }
              }),
              Contract: {
                connect: {
                  contract_address: contract_address.toLowerCase()
                }
              }
            }
          }
        },
        create: {
          slug,
          Params: {
            create: {
              ...params,
              ...(createdBy && {
                Creator: {
                  connect: {
                    id: createdBy
                  }
                }
              }),
              Contract: {
                connect: {
                  contract_address: contract_address.toLowerCase()
                }
              }
            }
          }
        },
        include: {
          Params: {
            include: {
              Contract: true
            }
          }
        }
      }
      // Difference between the `update` and `create` here is only the `slug`.
      type RoomsUpsert = Rooms & {
        Params: RoomParams & {
          Contract: Contracts
        }
      }
      const roomData = (await prisma.rooms.upsert(roomsUpsert)) as RoomsUpsert

      const {
        Params: { Contract, ...restParams },
        ...restRoomData
      } = roomData
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
      res.json({ data: mapRoomData })
    } catch (error: any) {
      // Errors could be from us throwing them as strings, or they could be from the db as an object.
      console.error('Server: /rooms/create', error)
      if (typeof error === 'string') {
        res.status(400).json({ error })
        return
      }
      if (error?.code === 'P2009') {
        res.status(400).json({ error: 'Missing a required value to create a room.' })
        return
      }
      res.status(400).json({ error: 'Something went wrong with the request' })
    }
  }
)

/**
 * Gets the room data from the slug
 */
router.get('/:slug', async (req: any, res: any) => {
  const slug = req.params.slug
  try {
    const { data, error } = await getGameDataFromDb(slug)

    res.json({ data, error })
  } catch (error) {
    console.error('Server: Fetch by slug', error)
    res.json({ error, data: [] })
  }
})

module.exports = router
