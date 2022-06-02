import bodyParser from 'body-parser';
import { Activities, Prisma } from '.prisma/client';
import { SetupType, ActivityTypes } from '@rumble-raffle-dao/rumble/types';
import express from 'express';
import prisma from '../../client';

const router = express.Router();
const jsonParser = bodyParser.json()

/**
 * Gets the room data from the slug
 * 
 * Returns whether the room is active or not.
 */
router.get('/', async (req: any, res: any) => {
  const { data, error } = await getAllActivities()
  if (error) {
    res.status(res.statusCode).json({ error });
    return;
  }
  res.json({ data });
})



router.post('/create', jsonParser, async (req: express.Request, res: express.Response) => {
  const data = await await prisma.activities.createMany({
    data: req.body,
  })

  res.json({ data });
})

// Need to conver the decimal of the killCount in the database to a number for the rumble package.
const convertKillCountToNum = (data: Activities): ActivityTypes => ({ ...data, killCounts: data.killCounts.map(k => k.toNumber()) });

export const getAllActivities = async () => {
  let error: string;
  try {
    const pveData = await prisma.activities.findMany({ where: { environment: 'PVE' } })
    const pvpData = await prisma.activities.findMany({ where: { environment: 'PVP' } })
    const reviveData = await prisma.activities.findMany({ where: { environment: 'REVIVE' } })
    // if (pveError || pvpError || reviveError) {
    //   error = 'Error when fetching activities tables.'
    // }
    const data: SetupType['activities'] = {
      PVE: pveData.map(convertKillCountToNum),
      PVP: pvpData.map(convertKillCountToNum),
      REVIVE: reviveData.map(convertKillCountToNum)
    }
    return { data, error };
  } catch (err) {
    console.error('Server: getAllActivities', error, err);
    return { error }
  }
}

module.exports = {
  router,
  getAllActivities
};
