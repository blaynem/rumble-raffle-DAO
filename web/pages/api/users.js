// import { PrismaClient } from '@rumble-raffle-dao/server'
// const prisma = new PrismaClient()
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_KEY
)

export default async function usersHandler(req, res) {
  const { publicAddress } = req?.query || req?.body

  if (!publicAddress) {
    res.status(401)
    return
  }

  console.log('--api/users.js--publicAddress', publicAddress)
  const nonce = crypto.randomBytes(16).toString('base64')
  console.log('--api/users.js--nonce', nonce)
  const {data, error} = await supabase.from('users').upsert({ publicAddress, nonce })
  // supabase upsert returns array
  res.status(200).json(data[0])
}