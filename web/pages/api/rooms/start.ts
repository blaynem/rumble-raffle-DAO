import { NextApiRequest, NextApiResponse } from 'next'
import { BASE_API_URL } from '../../../lib/constants';
import { withSessionRoute } from '../../../lib/with-session';

async function startGame(req: NextApiRequest, res: NextApiResponse) {
  const { user } = req.session;
  const { roomSlug } = req.query
  const body = {
    roomSlug,
    user
  }
  const { data, error } = await fetch(`${BASE_API_URL}/api/rooms/start`, {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify(body)
  }).then(res => res.json())
  if (error) {
    res.status(404).json({ error })
    return;
  }
  if (data !== null) {
    res.status(200).json({ data, error: null })
    return;
  }
  res.status(404).json({ error: "Couldn't start", data: null })
}

export default withSessionRoute(startGame)