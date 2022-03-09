// import { PrismaClient } from '@blockchainapp/prisma'
import crypto from 'crypto'
// const prisma = new PrismaClient()

export default async function usersHandler(req, res) {
  const { publicAddress } = req?.query || req?.body

  if (!publicAddress) {
    res.status(401)
    return
  }

  console.log('--api/users.js--publicAddress', publicAddress)
  const nonce = crypto.randomBytes(16).toString('base64')
  console.log('--api/users.js--nonce', nonce)
  // const upsertUser = await prisma.user.upsert({
  //   where: {
  //     publicAddress
  //   },
  //   update: {
  //     nonce
  //   },
  //   create: {
  //     publicAddress,
  //     nonce
  //   }
  // })
  // res.status(200).json(upsertUser)
  res.status(200).json({ publicAddress, nonce })
}