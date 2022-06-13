import { AuthDiscordVerifyPostResponse, VerifyDiscordId } from '@rumble-raffle-dao/types';
import { SERVER_BASE_PATH, SERVER_AUTH_DISCORD, PATH_VERIFY } from '@rumble-raffle-dao/types/constants';
import { NextApiRequest, NextApiResponse } from 'next'
import { BASE_API_URL } from '../../../lib/constants';
import { withSessionRoute } from '../../../lib/with-session'

/**
 * This file is used for verifying discord names.
 */

async function discordRoute(req: NextApiRequest, res: NextApiResponse) {
  const user = req.session.user
  if (req.method === 'POST') {
    const body: VerifyDiscordId = {
      signature: req.headers.signature as string,
      public_address: user.id,
      verification_id: req.body.verification_id,
    };
    const data: AuthDiscordVerifyPostResponse = await fetch(`${BASE_API_URL}${SERVER_BASE_PATH}${SERVER_AUTH_DISCORD}${PATH_VERIFY}`, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(body)
    }).then(res => res.json())
    res.json(data)
  } else {
    res.status(404).json({});
  }
}
export default withSessionRoute(discordRoute)