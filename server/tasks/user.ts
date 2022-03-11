import { PrismaClient, Prisma } from '@prisma/client'
import { faker } from '@faker-js/faker'
import crypto from 'crypto'

export const DeleteUsers = async () => {
  const prisma = new PrismaClient()

  await prisma.user.deleteMany({})
  await prisma.$disconnect()
  return
}

export const MakeUser = (
  id = faker.datatype.uuid(),
  publicAddress = faker.finance.ethereumAddress(),
  nonce = crypto.randomBytes(16).toString('base64')
) => {
  return {
    id,
    publicAddress,
    nonce
  }
}