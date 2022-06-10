import express from 'express';
import bodyParser from 'body-parser';
import prisma from '../../client';
import verifySignature from '../../utils/verifySignature';
import { LOGIN_MESSAGE, PATH_VERIFY } from '@rumble-raffle-dao/types/constants';
import { CORS_BASE_WEB_URL } from '../../../constants';

const router = express.Router();
const jsonParser = bodyParser.json()

const createVerifyLink = (key: string) => `${CORS_BASE_WEB_URL}${PATH_VERIFY}/${key}`;

/**
 * 1. Initial `/api/auth_discord/init` `POST` with params: discord_id, discord_tag, timeToExpire
 *  - returns only the verify_id for url { verify_id: 'abcd1234' }
 * 2. User will then be directed towards the `${BASE_WEB_URL}/verify/${verify_id}` url
 * 3. Upon visiting that page, user will be required to sign a message that will contain params: discord_id, discord_tag, verify_id
 *  - Signing will `POST` params: `signature`
 * 4. POST to `/api/auth_discord/verify` with params: `signature`
 *  - If sig verifies with address, will update the `discord_id` in database
 */

interface StoreState {
  [key: string]: AuthStoreValue
}

type AuthStoreValue = {
  verify_id: string;
  discord_id: string;
  discord_tag: string;
  expireTime: number;
}

interface AuthStore {
  add: (value: AddToStoreValue) => AuthStoreValue;
  get: (key: string) => AuthStoreValue | null;
}

type AddToStoreValue = {
  discord_id: string;
  discord_tag: string;
  msToExpire: number;
}

const Store = (initState: StoreState = {}): AuthStore => {
  const state: StoreState = initState;
  const generateKey = () => (Math.random() + 1).toString(36).substring(7);

  const delayDelete = (key: string, ms: number) => {
    setTimeout(() => {
      delete state[key];
    }, ms)
  }

  return {
    add: (value) => {
      const key = generateKey();
      const newObj: AuthStoreValue = {
        ...value,
        verify_id: key,
        expireTime: Date.now() + value.msToExpire
      }
      state[key] = newObj;
      delayDelete(key, value.msToExpire)
      return newObj
    },
    get: (key) => state[key] || null,
  }
}

const authStore = Store();


interface AuthDiscordInitPostBody extends express.Request {
  body: AddToStoreValue
}

interface AuthDiscordInitPostResponse {
  data: { verify_link: string } & AuthStoreValue;
  error?: string;
}



/**
 * Starts the auth process by taking in a discord_id, discord_tag and timeToExpire
 * API Response = {verify_id, discord_id, discord_tag, expireTime}
 */
router.post('/init', jsonParser, async (req: AuthDiscordInitPostBody, res: express.Response<AuthDiscordInitPostResponse>) => {
  const { discord_id, discord_tag, msToExpire } = req.body;
  // If any of the fields are missing, throw an error
  if (!discord_id || !discord_tag || !msToExpire) {
    res.status(400).json({ data: null, error: 'Missing a field' })
    return;
  }

  // We add the data to the authStore
  const data = authStore.add(req.body)
  res.json({
    data: {
      ...data,
      verify_link: createVerifyLink(data.verify_id)
    }
  })
})

interface AuthDiscordVerifyGetBody extends express.Request {
  params: {
    verify_id: string;
  }
}

interface AuthDiscordVerifyGetResponse {
  data: AuthStoreValue;
  error?: string;
}

// When user visit a certain page, we'll make the api call here.
router.get('/:verify_id', async (req: AuthDiscordVerifyGetBody, res: express.Response<AuthDiscordVerifyGetResponse>) => {
  const { verify_id } = req.params;
  const data = authStore.get(verify_id);
  res.json({ data })
})

interface VerifyDiscordId {
  signature: string;
  public_address: string;
  verify_id: string;
}

interface AuthDiscordVerifyPostBody extends express.Request {
  body: VerifyDiscordId
}

interface AuthDiscordVerifyPostResponse {
  data: string;
  error?: string;
}

// Signature will be sent to `/verify`
router.post('/verify', jsonParser, async (req: AuthDiscordVerifyPostBody, res: express.Response<AuthDiscordVerifyPostResponse>) => {
  const { signature, public_address, verify_id } = req.body
  // If any of the fields are missing, throw an error
  if (!signature || !public_address || !verify_id) {
    res.status(400).json({ data: null, error: 'Missing a field' })
    return;
  }
  const validatedSignature = verifySignature(public_address, signature, LOGIN_MESSAGE)

  // If signature validation fails, error
  if (!validatedSignature) {
    res.status(400).json({ data: null, error: 'Signature validation failed.' })
    return;
  }
  // If verification code expires, error
  const discordData = authStore.get(verify_id);
  if (discordData === null) {
    res.status(400).json({ data: null, error: 'Verification code expired.' })
    return;
  }
  // TODO: Add discord_id to database.
  try {
    await prisma.users.update({
      where: {
        id: public_address
      },
      data: {
        discord_tag: discordData.discord_tag,
        // discord_id: discordData.discord_id,
      }
    })
    res.json({ data: 'Verification successful!' })
  } catch (err) {
    console.error('auth_discord err:', err)
    res.status(400).json({ data: null, error: 'There was an error.' })
  }

})

module.exports = router;