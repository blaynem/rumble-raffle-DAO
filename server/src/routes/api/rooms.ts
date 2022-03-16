import express from 'express';
import bodyParser from 'body-parser';
import { definitions } from '../../../types';
import client from '../../client';

const router = express.Router();
const jsonParser = bodyParser.json()

// TODO: Implement create
router.post('/create', jsonParser, (req: any, res: any) => {
  console.log('---create called', req.body);
  res.status(res.statusCode).send({ thing: 'test' })
})

/**
 * Gets the room data from the slug
 * 
 * Returns whether the room is active or not.
 */
router.get('/:slug', async (req: any, res: any) => {
  const slug = req.params.slug;
  const { data, error } = await client.from<definitions['rooms']>('rooms').select('*').eq('slug', slug)
  res.json(data);
})

module.exports = router;