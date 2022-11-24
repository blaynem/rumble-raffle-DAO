import { NextApiRequest, NextApiResponse } from 'next'
import { withSessionRoute } from '../../../lib/with-session';
import prisma from '../../../client';
import { Prisma } from '.prisma/client';

type Body = {
  data: Prisma.SuggestedActivitiesCreateInput;
  guildId: string;
  userId: string;
}

interface ExtendedNextAPIRequest extends NextApiRequest {
  query: {}
  body: Body
}

async function usersHandler(req: ExtendedNextAPIRequest, res: NextApiResponse) {
  try {
    if (req.method === 'POST') {
      const { guildId, userId, data } = JSON.parse(req.body as any) as Body;
      if (!guildId || !userId) {
        throw Error('Missing required fields.')
      }

      await prisma.suggestedActivities.create({
        data: {
          ...data,
          // These fields must be added when a suggestion is added: custom_created_by, guild_id, is_custom
          custom_created_by: userId,
          guild_id: guildId,
          is_custom: true,
        }
      }).catch((err) => {
        console.error(err)
        throw Error('There was an error in the request. Please contact admins for help.')
      })

      res.status(200).json({ data: 'Success' })
    }
  } catch (error) {
    res.status(400).json({ error });
  }
}

export default withSessionRoute(usersHandler);