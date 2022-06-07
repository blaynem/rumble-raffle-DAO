import { NextApiRequest, NextApiResponse } from 'next'
import { withSessionRoute } from '../../../lib/with-session';
import prisma from '../../../client';
import { Prisma } from '.prisma/client';
import { verifySignature } from '../../../lib/authentication';
import { SETTINGS_MESSAGE } from '@rumble-raffle-dao/types/constants';
import { UserSettingsType } from '@rumble-raffle-dao/types';

interface ExtendedNextAPIRequest extends NextApiRequest {
  query: {
    id: string;
  }
}

export type UsersResponseType = {
  name?: string;
  id?: string;
  is_admin?: boolean;
  error?: any;
}


async function usersHandler(req: ExtendedNextAPIRequest, res: NextApiResponse<UsersResponseType>) {
  if (req.method === 'POST') {
    const { id } = req?.query;
    const { name, discord_id } = JSON.parse(req?.body) as UserSettingsType;
    const { signature } = req.headers;

    if (!signature || !id) {
      return res.status(400).json({ error: 'Request should have signature and id' })
    }

    const signatureVerified = verifySignature(id, signature as string, SETTINGS_MESSAGE);

    if (signatureVerified) {
      try {
        const trimmedName = name.trim();
        const user = await prisma.users.update({
          where: {
            id
          },
          data: {
            name: trimmedName,
            discord_id: discord_id,
          },
          select: {
            id: true,
            name: true,
            is_admin: true,
            discord_id: true
          }
        })

        // Update the ironsession user data
        req.session.user = { ...req.session.user, ...user }
        await req.session.save()

        // Everything handled via session, no need to pass data back
        res.status(200).json({});
        return;
      } catch (e) {
        console.error('users/id error:', e)
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          // The .code property can be accessed in a type-safe manner
          if (e.code === 'P2002') {
            res.status(401).json({ error: 'Name already taken.' })
          }
        }
      }
    } else {
      res.status(401).json({
        error: 'Signature verification failed'
      })
    }
  } else {
    // Anyone can search a user and we'll return the players name + public_address
    const { id } = req?.query;
    const data = await prisma.users.findUnique({
      where: {
        id
      },
      select: {
        id: true,
        name: true,
      }
    })

    res.status(200).json(data);
  }
}

export default withSessionRoute(usersHandler);