import bodyParser from 'body-parser'
import { Activities, Prisma } from '.prisma/client'
import { SetupType, ActivityTypes, ActivitiesObjType } from '@rumble-raffle-dao/rumble/types'
import express from 'express'
import prisma from '../../client'

const router = express.Router()
const jsonParser = bodyParser.json()

/**
 * Gets the room data from the slug
 *
 * Returns whether the room is active or not.
 */
router.get('/', async (req: any, res: any) => {
  const { data, error } = await getAllActivities()
  if (error) {
    res.status(res.statusCode).json({ error })
    return
  }
  res.json({ data })
})

router.post('/create', jsonParser, async (req: express.Request, res: express.Response) => {
  const data = await await prisma.activities.createMany({
    data: req.body
  })

  res.json({ data })
})

// Need to conver the decimal of the killCount in the database to a number for the rumble package.
const convertKillCountToNum = (data: Activities): ActivityTypes => ({
  ...data,
  killCounts: data.killCounts.map(k => k.toNumber())
})

/**
 * If guild_id is excluded, fetches all non-custom activities only.
 * @param guild_id
 * @returns
 */
export const getAllActivities = async (
  guild_id?: string
): Promise<{ data: ActivitiesObjType | null; error?: any }> => {
  try {
    let pveData: Activities[], pvpData: Activities[], reviveData: Activities[]
    // If theres a guild Id then we can grab all the custom events.
    if (guild_id) {
      pveData = await prisma.activities.findMany({
        where: {
          OR: [
            { environment: 'PVE', is_custom: false },
            { environment: 'PVE', is_custom: true, guild_id }
          ]
        }
      })
      pvpData = await prisma.activities.findMany({
        where: {
          OR: [
            { environment: 'PVP', is_custom: false },
            { environment: 'PVP', is_custom: true, guild_id }
          ]
        }
      })
      reviveData = await prisma.activities.findMany({
        where: {
          OR: [
            { environment: 'REVIVE', is_custom: false },
            { environment: 'REVIVE', is_custom: true, guild_id }
          ]
        }
      })
    } else {
      pveData = await prisma.activities.findMany({
        where: { environment: 'PVE', is_custom: false }
      })
      pvpData = await prisma.activities.findMany({
        where: { environment: 'PVP', is_custom: false }
      })
      reviveData = await prisma.activities.findMany({
        where: { environment: 'REVIVE', is_custom: false }
      })
    }
    // if (pveError || pvpError || reviveError) {
    //   error = 'Error when fetching activities tables.'
    // }
    const data: SetupType['activities'] = {
      PVE: pveData.map(convertKillCountToNum),
      PVP: pvpData.map(convertKillCountToNum),
      REVIVE: reviveData.map(convertKillCountToNum)
    }
    return { data }
  } catch (err) {
    console.error('Server: getAllActivities', err)
    return { error: err, data: null }
  }
}

module.exports = {
  router,
  getAllActivities
}
