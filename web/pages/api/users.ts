import { NextApiRequest, NextApiResponse } from 'next'
import crypto from 'crypto'
import { faker } from "@faker-js/faker";
import prisma from '../../client-temp';

// idk fun to have a fake name instead of not.
const fancyName = () => `${faker.name.jobType().toUpperCase()}-${faker.animal.type().toUpperCase()}-${faker.datatype.number(100)}`

type UserResponse = {
  nonce: string;
  name: string;
  id?: string;
  is_admin?: boolean;
  error?: any;
}

export default async function usersHandler(req: NextApiRequest, res: NextApiResponse<UserResponse>) {
  const { id } = req?.query || req?.body

  if (!id) {
    res.status(401)
    return
  }

  const nonce = crypto.randomBytes(16).toString('base64')

  const findUserData = await prisma.users.findUnique({
    where: {
      id
    },
    select: {
      id: true,
      name: true,
    }
  })

  // If we find the data, we want to update the nonce.
  if (findUserData) {
    const updatedUser = await prisma.users.update({
      where: {
        id
      },
      data: {
        nonce
      },
      select: {
        name: true,
        id: true,
        is_admin: true,
      }
    })
    // if (error) {
    //   res.status(401).json({ error: 'Something went wrong in updating the nonce.' })
    // }
    const returnedData = {
      ...updatedUser,
      nonce
    }
    res.status(200).json(returnedData)
    return;
  }
  
  // If we didn't find the user, then we add them to the db with a fancy name
  const userData = await prisma.users.create({
    data: {
      id, nonce, name: fancyName()
    },
    select: {
      id: true, name: true, nonce: true
    }
  })
  // if (error) {
  //   res.status(401).json({ error: 'Something went wrong in creating the user.' })
  // }
  res.status(200).json(userData)
}