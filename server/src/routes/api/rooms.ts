import express from 'express';
import bodyParser from 'body-parser';
import { definitions, RoomDataType } from '@rumble-raffle-dao/types';
import client from '../../client';
import { addNewRoomToMemory } from '../../helpers/roomRumbleData';

const router = express.Router();
const jsonParser = bodyParser.json()

/**
 * Flow of creating a room
 * - Create `room_params` entry
 * - Create `room` entry
 */
router.post('/create', jsonParser, async (req: any, res: any) => {
  const { contract, user, ...restReqBody } = req.body;
  const { data: userData, error: userError } = await client.from<definitions['users']>('users').select('is_admin').eq('public_address', user.public_address)
  // If they aren't an admin, we say no.
  if (!userData[0]?.is_admin) {
    res.status(401).json({ error: 'Only admin may create rooms at this time.' })
    return;
  }
  const contract_id = contract.contract_address;
  const created_by = user.public_address;
  // Insert room_param
  const { data: roomParamsData, error: roomParamsError } = await client.from<definitions['room_params']>('room_params').insert({
    ...restReqBody,
    created_by,
    contract_id
  });
  if (roomParamsError) {
    res.status(res.statusCode).json({ error: roomParamsError });
    return;
  }
  // Insert Rooms
  const { id: roomParamId } = roomParamsData[0];
  const { data, error } = await client.from<definitions['rooms']>('rooms').insert({
    params_id: roomParamId,
    slug: restReqBody.slug,
    created_by,
    contract_id
  })
  if (error) {
    res.status(res.statusCode).json({ error });
    return;
  }
  // If room is created, we add it to memory.
  const roomData: RoomDataType = {
    created_by,
    contract: contract,
    gameData: null,
    game_started: false,
    id: data[0].id,
    params: roomParamsData[0],
    players: [],
    slug: data[0].slug,
  };
  addNewRoomToMemory(roomData);
  res.json({ data });
})

/**
 * Gets the room data from the slug
 */
router.get('/:slug', async (req: any, res: any) => {
  const slug = req.params.slug;
  const { data, error } = await client.from<definitions['rooms']>('rooms').select('*').eq('slug', slug)
  if (error) {
    res.status(res.statusCode).json({ error });
    return;
  }
  res.json({ data });
})

module.exports = router;