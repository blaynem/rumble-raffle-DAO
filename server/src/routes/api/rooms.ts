import express from 'express';
import bodyParser from 'body-parser';
import { definitions, RoomDataType } from '../../../types';
import client from '../../client';
import { addNewRoomToMemory } from '../../initServer';

const router = express.Router();
const jsonParser = bodyParser.json()

router.post('/create', jsonParser, async (req: any, res: any) => {
  // Insert room_param
  const {user, ...restReqBody} = req.body;
  const created_by = user.publicAddress;
  const { data: roomParamsData, error: roomParamsError } = await client.from<definitions['room_params']>('room_params').insert({
    ...restReqBody,
    created_by
  });
  if (roomParamsError) {
    res.status(res.statusCode).json({ error: roomParamsError });
    return;
  }
  // Insert Rooms
  const {id: roomParamId} = roomParamsData[0];
  const { data, error } = await client.from<definitions['rooms']>('rooms').insert({
    params_id: roomParamId,
    slug: restReqBody.slug,
    created_by
  })
  if (error) {
    res.status(res.statusCode).json({ error });
    return;
  }
  // If room is created, we add it to memory.
  const roomData: RoomDataType = {
    gameData: null,
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
 * 
 * Returns whether the room is active or not.
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