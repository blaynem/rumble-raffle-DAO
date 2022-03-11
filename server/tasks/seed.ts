import { PrismaClient, Prisma } from '@prisma//client'
import { faker } from '@faker-js/faker'

import { DeleteUsers, MakeUser } from './user'

export const ClearAllData = async () => {
  await DeleteUsers()
  return
}

export const SeedDbAsUser = async (makeNum = 1) => {
  const prisma = new PrismaClient()
  await ClearAllData()
  // create everything starting from users
  for (let user = 0; user <= makeNum; user++) {
    const user = MakeUser()

    const makeData: Prisma.UserCreateInput = {
      ...user,
    }
    console.log('data: ', makeData)
    const createUser = await prisma.user.create({ data: makeData })
    console.log('User: ', JSON.stringify(createUser))
  }

  await prisma.$disconnect()
  return
}