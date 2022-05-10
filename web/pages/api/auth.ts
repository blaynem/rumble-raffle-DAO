import { NextApiRequest, NextApiResponse } from 'next'
import { recoverPersonalSignature } from 'eth-sig-util'
import { bufferToHex } from 'ethereumjs-util'
import { withSessionRoute } from '../../lib/with-session'
import { NONCE_MESSAGE } from '../../lib/constants'
import prisma from '../../client-temp';

async function auth(req: NextApiRequest, res: NextApiResponse) {
  const { signature, id} = req.body
  if (!signature || !id) {
    return res.status(400).json({ error: 'Request should have signature and id (public_address)' })
  }

  const user = await prisma.users.findUnique({
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

  if (!user.is_admin) {
    // We don't want to show this in cookies if user isn't an admin.
    delete user.is_admin;
  }

  if (!user) {
    res.status(404).json({ error: 'Not found' })
    return null
  }
  const msg = `${NONCE_MESSAGE} ${user.nonce}`

  // We now are in possession of msg, id (public_address) and signature. We
  // will use a helper from eth-sig-util to extract the address from the signature
  const msgBufferHex = bufferToHex(Buffer.from(msg, 'utf8'))
  const address = recoverPersonalSignature({
    data: msgBufferHex,
    sig: signature
  })

  // The signature verification is successful if the address found with
  // sigUtil.recoverPersonalSignature matches the initial public_address
  if (address.toLowerCase() === id.toLowerCase()) {
    // return user
    req.session.user = user
    await req.session.save()
    res.status(200).json(user)
  } else {
    res.status(401).json({
      error: 'Signature verification failed'
    })

    return null
  }
}

export default withSessionRoute(auth)