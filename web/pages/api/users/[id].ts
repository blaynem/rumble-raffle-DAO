import { NextApiRequest, NextApiResponse } from 'next'
import { withSessionRoute } from '../../../lib/with-session';
import prisma from '../../../client';

interface ExtendedNextAPIRequest extends NextApiRequest {
  query: {
    id: string;
  }
}

type ResponseType = {
  id: string;
  name: string;
  is_admin: boolean;
  nonce: string;
}

async function usersHandler(req: ExtendedNextAPIRequest, res: NextApiResponse<ResponseType>) {
  if (req.method === 'POST') {
    const { id } = req?.query;
    const { name } = JSON.parse(req?.body);

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
        nonce: true,
        name: true,
        is_admin: true,
      }
    })

    // if (error) {
    //   if (error.code === '23505') {
    //     res.status(401).json({ error: 'Name already taken.' })
    //     return;
    //   }
    //   res.status(401).json({ error: 'Something went wrong in updating the user.' })
    // }

    req.session.user = user
    await req.session.save()

    res.status(200).json(user);
  } else {
    const { id } = req?.query;
    const data = await prisma.users.findUnique({
      where: {
        id
      },
      select: {
        id: true,
        nonce: true,
        name: true,
        is_admin: true,
      }
    })

    // if (error) {
    //   res.status(401).json({ error: 'Something went wrong fetching the user.' })
    // }
    res.status(200).json(data);
  }
}

export default withSessionRoute(usersHandler);