import { SetupType, ActivityTypes } from '@rumble-raffle-dao/rumble/types';
import { definitions } from '@rumble-raffle-dao/types';
import express from 'express';
import client from '../../client';

const router = express.Router();

/**
 * Gets the room data from the slug
 * 
 * Returns whether the room is active or not.
 */
router.get('/', async (req: any, res: any) => {
  const {data, error} = await getAllActivities()
  if (error) {
    res.status(res.statusCode).json({ error });
    return;
  }
  res.json({ data });
})

export const getAllActivities = async () => {
  let error: string;
  try {
    const { data: pveData, error: pveError } = await client.from<definitions['activities']>('activities').select(`*`).eq('environment', 'PVE')
    const { data: pvpData, error: pvpError } = await client.from<definitions['activities']>('activities').select(`*`).eq('environment', 'PVP')
    const { data: reviveData, error: reviveError } = await client.from<definitions['activities']>('activities').select(`*`).eq('environment', 'REVIVE')
    if (pveError || pvpError || reviveError) {
      error = 'Error when fetching activities tables.'
    }
    // Type casting this because number[] are returning as unknown[] from definitions.
    const data: SetupType['activities'] = {
      PVE: pveData as ActivityTypes[],
      PVP: pvpData as ActivityTypes[],
      REVIVE: reviveData as ActivityTypes[]
    }
    return {data, error};
  } catch (err) {
    console.error('Server: getAllActivities', error, err);
    return {error}
  }
}

module.exports = {
  router,
  getAllActivities
};
