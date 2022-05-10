import { Prisma } from '.prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { withSessionRoute } from '../../lib/with-session'


async function userRoute(req: NextApiRequest, res: NextApiResponse<Pick<Prisma.UsersGroupByOutputType, 'id' | 'name' | 'is_admin' | 'nonce'>>) {
  if (req.session.user) {
    res.json({
      ...req.session.user,
    })
  } else {
    res.json({
      id: null,
      name: null,
      nonce: null,
      is_admin: false,
    })
  }
}
export default withSessionRoute(userRoute)