import express from 'express';
import bodyParser from 'body-parser';
import roomRumbleData from '../../roomRumbleData';

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
router.get('/:slug', (req: any, res: any) => {
  const slug = req.params.slug;
  const activeRoom = Boolean(roomRumbleData[slug])
  res.json({ activeRoom });
})

module.exports = router;