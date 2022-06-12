import express from 'express';
import bodyParser from 'body-parser';
import prisma from '../../client';
import verifySignature from '../../utils/verifySignature';
import { PATH_UNLINK_DISCORD, PATH_VERIFY, PATH_VERIFY_INIT } from '@rumble-raffle-dao/types/constants';
import { CORS_BASE_WEB_URL } from '../../../constants';
import {
  StoreState,
  AuthStore,
  AuthStoreValue,
  AuthDiscordInitPostBody,
  AuthDiscordInitPostResponse,
  AuthDiscordVerifyGetBody,
  AuthDiscordVerifyGetResponse,
  AuthDiscordVerifyPostBody,
  AuthDiscordVerifyPostResponse
} from '@rumble-raffle-dao/types';

const router = express.Router();
const jsonParser = bodyParser.json()

const TEN_MINUTES = 600000
const createVerifyLink = (key: string) => `${CORS_BASE_WEB_URL}${PATH_VERIFY}/${key}`;

/**
 * 1. Initial `/api/auth_discord/init` `POST` with params: discord_id, discord_tag, timeToExpire
 *  - returns only the verification_id for url { verification_id: 'abcd1234' }
 * 2. User will then be directed towards the `${BASE_WEB_URL}/verify/${verification_id}` url
 * 3. Upon visiting that page, user will be required to sign a message that will contain params: discord_id, discord_tag, verification_id
 *  - Signing will `POST` params: `signature`
 * 4. POST to `/api/auth_discord/verify` with params: `signature`
 *  - If sig verifies with address, will update the `discord_id` in database
 */

const Store = (initState: StoreState = {}): AuthStore => {
  const state: StoreState = initState;
  const generateKey = () => (Math.random() + 1).toString(36).substring(7);

  const delayDelete = (key: string, ms: number) => {
    setTimeout(() => {
      delete state[key];
    }, ms)
  }

  return {
    add: (value, msToExpire) => {
      const key = generateKey();
      const newObj: AuthStoreValue = {
        ...value,
        verification_id: key,
        expireTime: Date.now() + msToExpire
      }
      state[key] = newObj;
      delayDelete(key, msToExpire)
      return newObj
    },
    get: (key) => state[key] || null,
    remove: (key) => {
      delete state[key];
    },
  }
}

const authStore = Store();


/**
 * Starts the auth process by taking in a discord_id, discord_tag and timeToExpire
 * API Response = {verification_id, discord_id, discord_tag, expireTime}
 */
router.post(PATH_VERIFY_INIT, jsonParser, async (req: AuthDiscordInitPostBody, res: express.Response<AuthDiscordInitPostResponse>) => {
  const { discord_id } = req.body;
  // If any of the fields are missing, throw an error
  if (!discord_id) {
    res.status(400).json({ data: null, error: 'Missing a field' })
    return;
  }

  // We add the data to the authStore
  const data = authStore.add(req.body, TEN_MINUTES)
  res.json({
    data: {
      ...data,
      verify_link: createVerifyLink(data.verification_id)
    }
  })
})


// When user visit a certain page, we'll make the api call here.
router.get('/:verification_id', async (req: AuthDiscordVerifyGetBody, res: express.Response<AuthDiscordVerifyGetResponse>) => {
  const { verification_id } = req.params;
  const data = authStore.get(verification_id);
  res.json({ data })
})


// Signature will be sent to `/verify`
router.post(PATH_VERIFY, jsonParser, async (req: AuthDiscordVerifyPostBody, res: express.Response<AuthDiscordVerifyPostResponse>) => {
  try {
    const { signature, public_address, verification_id } = req.body
    // If any of the fields are missing, throw an error
    if (!signature || !public_address || !verification_id) {
      res.status(400).json({ data: null, error: 'Missing a field' })
      return;
    }

    // If the store comes back with null, then there is no code.
    if (authStore.get(verification_id) === null) {
      res.status(400).json({ data: null, error: 'Unable to find verification code.' })
      return;
    }

    const { discord_id, discord_tag } = authStore.get(verification_id);
    const verifyMessage = `Discord Tag: ${discord_tag}\nDiscord Id: ${discord_id}\nVerification Id: ${verification_id}`
    const validatedSignature = verifySignature(public_address, signature, verifyMessage)

    // If signature validation fails, error
    if (!validatedSignature) {
      res.status(400).json({ data: null, error: 'Signature validation failed.' })
      return;
    }
    // If verification code expires, error
    const discordData = authStore.get(verification_id);
    if (discordData === null) {
      res.status(400).json({ data: null, error: 'Verification code expired.' })
      return;
    }

    // We first clear all other possible discord_ids.
    await prisma.users.updateMany({
      where: {
        discord_id: discordData.discord_id,
      },
      data: {
        discord_id: null
      }
    })

    // We then update the correct public_address with the correct discord_id.
    await prisma.users.update({
      where: {
        id: public_address
      },
      data: {
        discord_id: discordData.discord_id,
      }
    })
    // Finally, we remove the verification id.
    authStore.remove(verification_id);
    res.json({ data: 'Verification successful!' })
  } catch (err) {
    console.error('auth_discord err:', err)
    res.status(400).json({ data: null, error: 'There was an error.' })
  }
})

/**
 * If a user wants to completely unlink their discord id, we allow them to do so.
*/
router.post(PATH_UNLINK_DISCORD, jsonParser, async (req: express.Request<{ body: { discord_id: string; } }>, res: express.Response<AuthDiscordVerifyPostResponse>) => {
  try {
    const { discord_id } = req.body
    // If any of the fields are missing, throw an error
    if (!discord_id) {
      res.status(400).json({ data: null, error: '`discord_id` is a required field' })
      return;
    }

    // We clear all other possible discord_ids.
    await prisma.users.updateMany({
      where: {
        discord_id,
      },
      data: {
        discord_id: null
      }
    })
    res.json({ data: 'Your discord id has been successfully unlinked.' })
  } catch (err) {
    console.error(`auth_discord/${PATH_UNLINK_DISCORD}`, err)
    res.status(400).json({ data: null, error: 'There was an error.' })
  }
})

module.exports = router;