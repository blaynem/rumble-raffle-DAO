import express from 'express';
import prisma from '../../client';

const router = express.Router();


// When user visit a certain page, we'll make the api call here.
router.get('', async (req: express.Request, res: express.Response) => {
  const { discord_id } = req.query;
  const data = await prisma.users.findFirst({
    where: { discord_id: discord_id as string },
    select: {
      id: true,
      name: true,
      discord_id: true,
    }
  })
  res.json(data)
})


module.exports = router;