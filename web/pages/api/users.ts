import crypto from 'crypto'
import { faker } from "@faker-js/faker";

import supabase from '../../client';
import { SupabaseUserType } from './auth';
// idk fun to have a fake name instead of not.
const fancyName = `${faker.name.jobType().toUpperCase()}-${faker.animal.type().toUpperCase()}-${faker.datatype.number(100)}`

export default async function usersHandler(req, res) {
  const { publicAddress } = req?.query || req?.body

  if (!publicAddress) {
    res.status(401)
    return
  }

  const nonce = crypto.randomBytes(16).toString('base64')

  const { data: findUserData, error: findUserError } = await supabase.from<SupabaseUserType>('users').select('publicAddress, name').eq('publicAddress', publicAddress)
  // If we find the data, we want to update the nonce.
  if (findUserData.length > 0) {
    const { data, error } = await supabase.from<SupabaseUserType>('users').update({ nonce }).match({ publicAddress })
    if (error) {
      res.status(401).json({ error: 'Something went wrong in updating the nonce.' })
    }
    const returnedData = {
      ...findUserData[0],
      nonce
    }
    res.status(200).json(returnedData)
    return;
  }
  // If we didn't find the user, then we add them to the db with a fancy name
  const { data, error } = await supabase.from<SupabaseUserType>('users').insert({ publicAddress, nonce, name: fancyName }).select('publicAddress, name, nonce')
  if (error) {
    res.status(401).json({ error: 'Something went wrong in creating the user.' })
  }
  res.status(200).json(data[0])
}