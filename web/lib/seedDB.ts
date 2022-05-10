import faker from "@faker-js/faker"
// import { definitions, SupabaseUserType } from "@rumble-raffle-dao/types"
// import client from "../client"

// const fancyName = () => `${faker.name.jobType().toUpperCase()}-${faker.animal.type().toUpperCase()}-${faker.datatype.number(1000)}`

// const testingRoomSlug = 'testing-room';
// const testingRoomId = '21d8cbd9-2f1b-4802-8516-84c9fd5e0611';
// const testingNonce = 'testing-nonce'
// export const bulkAddPlayer = async () => {
//   const amtUsers = 800;
//   const usersArr: SupabaseUserType[] = [];
//   for(let i = 0; i < amtUsers; i++) {
//     const tempUser: SupabaseUserType = {
//       name: fancyName(),
//       nonce: testingNonce,
//       public_address: `testing-pbAddy-${i}`
//     };
//     usersArr.push(tempUser)
//   }
//   const userRes = await client.from<SupabaseUserType>('users').insert(usersArr).select('public_address, name, nonce')
//   console.log({ userRes });
  
//   const addRoomAndSlug: Omit<definitions["players"], 'time_joined'>[] = usersArr.map(user => ({ player: user.public_address, room_id: testingRoomId, slug: testingRoomSlug }))
//   const playerRes = await client.from<definitions["players"]>('players').insert(addRoomAndSlug)
//   console.log({ playerRes });
// }

// export const deleteSeededData = async () => {
//   const playerRes = await client.from<definitions["players"]>('players').delete().match({ room_id: testingRoomId })
//   console.log({ playerRes });
//   const userRes = await client.from<SupabaseUserType>('users').delete().match({ nonce: testingNonce })
//   console.log({ userRes });
// }