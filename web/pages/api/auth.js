import { recoverPersonalSignature } from 'eth-sig-util'
import { bufferToHex } from 'ethereumjs-util'
import { withSessionRoute } from '../../lib/with-session'
import { NONCE_MESSAGE } from '../../lib/constants'
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_KEY
)

async function auth(req, res) {
  const { signature, publicAddress } = req.body
  if (!signature || !publicAddress) {
    return res.status(400).json({ error: 'Request should have signature and publicAddress' })
  }

  // get user from the database where publicAddress
  const {error, data} = await supabase.from('users').select(`publicAddress, nonce, name`).eq('publicAddress', publicAddress)
  // supabase returns array
  const user = data[0];

  if (!user) {
    res.status(404).json({ error: 'Not found' })
    return null
  }
  const msg = `${NONCE_MESSAGE}${user.nonce}`

  // We now are in possession of msg, publicAddress and signature. We
  // will use a helper from eth-sig-util to extract the address from the signature
  const msgBufferHex = bufferToHex(Buffer.from(msg, 'utf8'))
  const address = recoverPersonalSignature({
    data: msgBufferHex,
    sig: signature
  })

  // The signature verification is successful if the address found with
  // sigUtil.recoverPersonalSignature matches the initial publicAddress
  if (address.toLowerCase() === publicAddress.toLowerCase()) {
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