import { NextApiRequest, NextApiResponse } from 'next'
import { withSessionRoute } from '../../../lib/with-session'
import { LOGIN_MESSAGE } from '../../../lib/constants'
import prisma from '../../../client';
import faker from '@faker-js/faker'
import { verifySignature } from '../../../lib/wallet'

// idk fun to have a fake name instead of not.
const fancyName = () => `${faker.name.jobType().toUpperCase()}-${faker.animal.type().toUpperCase()}-${faker.datatype.number(100)}`

async function auth(req: NextApiRequest, res: NextApiResponse) {
  const { signature, id } = req.body
  if (!signature || !id) {
    return res.status(400).json({ error: 'Request should have signature and id (public_address)' })
  }

  const signatureVerified = verifySignature(id, signature as string, LOGIN_MESSAGE);

  // If signature was verified
  if (signatureVerified) {
    // We upsert the user
    const user = await prisma.users.upsert({
      where: {
        id
      },
      update: {
        id,
      },
      create: {
        id, name: fancyName()
      }
    })

    if (!user.is_admin) {
      // We don't want to show this in cookies if user isn't an admin.
      delete user.is_admin;
    }

    if (!user) {
      res.status(404).json({ error: 'Not found' })
      return null
    }
    // sets the user object on ironsession
    req.session.user = user
    // Saves the session and sets the cookie header to be sent once the response is sent.
    await req.session.save()
    // returns user cookie details
    res.status(200).json(user)
  } else {
    res.status(401).json({
      error: 'Signature verification failed'
    })

    return null
  }
}

export default withSessionRoute(auth)