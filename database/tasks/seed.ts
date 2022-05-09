import { PrismaClient, Prisma } from '@prisma/client'
import { faker } from '@faker-js/faker'

import { DeleteCollections, MakeCollection } from './collection'
import { DeleteUsers, MakeUser } from './user'

export const ClearAllData = async () => {
  await DeleteCollections()
  await DeleteUsers()
  return
}

export const SeedDbAsUser = async (makeNum = 1) => {
  const prisma = new PrismaClient()
  await ClearAllData()
  // create everything starting from users
  for (let user = 0; user <= makeNum; user++) {
    const name = `${faker.company.catchPhraseAdjective()} ${faker.animal.dog()}`
    const user = MakeUser()

    const makeData: Prisma.UserCreateInput = {
      ...user,
      collections: {
        create: {
          osCollectionSlug: faker.helpers.slugify(name.toLowerCase()),
          osFloor: 0,
          websites: '{[{"name":"homepage", "url": "http://"}]}'
        }
      }
    }
    console.log('data: ', makeData)
    const createUser = await prisma.user.create({ data: makeData })
    console.log('User: ', JSON.stringify(createUser))
  }

  await prisma.$disconnect()
  return
}