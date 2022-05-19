import { NextApiRequest, NextApiResponse } from 'next'
import { withSessionRoute } from '../../../lib/with-session';
import prisma from '../../../client';
import { bufferToHex } from 'ethereumjs-util';
import { recoverPersonalSignature } from 'eth-sig-util';
import { SETTINGS_MESSAGE } from '../../../lib/constants';
import { Prisma } from '.prisma/client';

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
    const { name } = JSON.parse(req?.body);
    const { signature } = req.headers;

    if (!signature || !id) {
      return res.status(400).json({ error: 'Request should have signature and id' })
    }

    // Recover the address from signature
    const msgBufferHex = bufferToHex(Buffer.from(SETTINGS_MESSAGE, 'utf8'))
    const address = recoverPersonalSignature({
      data: msgBufferHex,
      sig: signature as string,
    })

    if (address.toLowerCase() === id.toLowerCase()) {
      try {
        const trimmedName = name.trim();
        const user = await prisma.users.update({
          where: {
            id
          },
          data: {
            name: trimmedName
          },
          select: {
            id: true,
            name: true,
            is_admin: true,
          }
        })

        // Update the ironsession user data
        req.session.user = user
        await req.session.save()

        res.status(200).json(user);
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