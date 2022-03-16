import express from 'express';
import bodyParser from 'body-parser';
import { definitions } from '../../../types';
import client from '../../client';
import { addNewRoomToMemory } from '../../initServer';

const router = express.Router();
const jsonParser = bodyParser.json()

router.post('/create', jsonParser, async (req: any, res: any) => {
  const { data, error } = await client.from<definitions['rooms']>('rooms').insert({
    id: req.body.id,
    // TODO: Add a check here for the params
    params: req.body.params,
    slug: req.body.slug,
    created_by: req.body.user.id
  })
  if (error) {
    res.status(res.statusCode).json({ error });
    return;
  }
  // If room is created, we add it to memory.
  const roomData = {
    ...data[0],
    players: [],
    params: data[0].params
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