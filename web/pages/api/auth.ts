import { recoverPersonalSignature } from 'eth-sig-util'
import { bufferToHex } from 'ethereumjs-util'
import { withSessionRoute } from '../../lib/with-session'
import { NONCE_MESSAGE } from '../../lib/constants'
import supabase from '../../client';
import {SupabaseUserType} from '@rumble-raffle-dao/types/web';

async function auth(req, res) {
  const { signature, public_address } = req.body
  if (!signature || !public_address) {
    return res.status(400).json({ error: 'Request should have signature and public_address' })
  }

  // get user from the database where public_address
  const {error, data} = await supabase.from<SupabaseUserType>('users').select(`public_address, nonce, name`).eq('public_address', public_address)
  // supabase returns array
  const user = data[0];

  if (!user) {
    res.status(404).json({ error: 'Not found' })
    return null
  }
  const msg = `${NONCE_MESSAGE}${user.nonce}`

  // We now are in possession of msg, public_address and signature. We
  // will use a helper from eth-sig-util to extract the address from the signature
  const msgBufferHex = bufferToHex(Buffer.from(msg, 'utf8'))
  const address = recoverPersonalSignature({
    data: msgBufferHex,
    sig: signature
  })

  // The signature verification is successful if the address found with
  // sigUtil.recoverPersonalSignature matches the initial public_address
  if (address.toLowerCase() === public_address.toLowerCase()) {
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