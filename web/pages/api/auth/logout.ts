import { NextApiRequest, NextApiResponse } from 'next'
import { withSessionRoute } from '../../../lib/with-session';

/**
 * This file is specifically for using the useSWR hook with logging out of a user.
 */

async function logoutRoute(req: NextApiRequest, res: NextApiResponse) {
  req.session.destroy();
  res.json(null)
}
export default withSessionRoute(logoutRoute)