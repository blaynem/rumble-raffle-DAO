import { NextApiRequest, NextApiResponse } from 'next'
import { withSessionRoute } from '../../../lib/with-session'

/**
 * This file is specifically for holding the user cookie in SWR.
 */

async function userRoute(req: NextApiRequest, res: NextApiResponse) {
  const user = req.session.user
  if (user) {
    res.json({
      ...user,
    })
  } else {
    res.json({})
  }
}
export default withSessionRoute(userRoute)