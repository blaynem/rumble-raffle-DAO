import { SupabaseUserType } from '@rumble-raffle-dao/types'
import { NextApiRequest, NextApiResponse } from 'next'
import { withSessionRoute } from '../../lib/with-session'


async function userRoute(req: NextApiRequest, res: NextApiResponse<SupabaseUserType>) {
  if (req.session.user) {
    // in a real world application you might read the user id from the session and then do a database request
    // to get more information on the user if needed
    res.json({
      ...req.session.user,
    })
  } else {
    res.json({
      name: null,
      nonce: null,
      public_address: null,
      is_admin: false,
    })
  }
}
export default withSessionRoute(userRoute)