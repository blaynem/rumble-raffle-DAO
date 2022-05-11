import { SetupType, ActivityTypes } from '@rumble-raffle-dao/rumble/types';
import express from 'express';
import prisma from '../../client';

const router = express.Router();

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

export const getAllActivities = async () => {
  let error: string;
  try {
    const pveData = await prisma.activities.findMany({ where: { environment: 'PVE' } })
    const pvpData = await prisma.activities.findMany({ where: { environment: 'PVP' } })
    const reviveData = await prisma.activities.findMany({ where: { environment: 'REVIVE' } })
    // if (pveError || pvpError || reviveError) {
    //   error = 'Error when fetching activities tables.'
    // }
    // Type casting this because number[] are returning as unknown[] from supabase.
    const data: SetupType['activities'] = {
      PVE: pveData as ActivityTypes[],
      PVP: pvpData as ActivityTypes[],
      REVIVE: reviveData as ActivityTypes[]
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
