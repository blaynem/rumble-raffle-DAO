import client from "../client";
// import { definitions } from "@rumble-raffle-dao/types";
// import { UPDATE_ACTIVITY_LOG_ROUND, UPDATE_ACTIVITY_LOG_WINNER } from "@rumble-raffle-dao/types/constants";
// import { Server } from "socket.io";
// import availableRoomsData, { defaultGameState } from "../helpers/roomRumbleData";

// //TODO: MUST ADD THE LOGS BACK TO THE availableRoomsData CUZ OTHERWISE THINGS KILL
// // TODO: REMOVE THIS. SHOULD NOT BE ABLE TO CLEAR GAME DATA.
// // ONLY USED FOR TESTING.
// async function clearGame(io: Server, data: { playerData: definitions["users"]; roomSlug: string }) {
//   try {
//     // Check if they're an admin.
//     const roomResp = await client.from<definitions["rooms"]>('rooms').select('created_by, id').eq('slug', data.roomSlug);

//     const roomId = roomResp.data[0]?.id;

//     if (data.playerData?.public_address !== roomResp.data[0]?.created_by) {
//       console.warn(`${data.playerData?.public_address} tried to clear a game they are not the owner of.`);
//       return;
//     }

//     const { data: userData, error: userError } = await client.from<definitions['users']>('users').select('is_admin').eq('public_address', data.playerData?.public_address)
//     // If they aren't an admin, we do nothing.
//     if (!userData[0].is_admin) {
//       return;
//     }

//     const roomsRes = await client.from<definitions["rooms"]>('rooms').update({ game_started: false, game_completed: false, winners: null }).match({ id: roomId });
//     const payoutsRes = await client.from<definitions["payouts"]>('payouts').delete().match({ room_id: roomId });
//     const gameRoundLogsRes = await client.from<definitions['game_round_logs']>('game_round_logs').delete().match({ room_id: roomId });

//     console.log('---cleared', { errors: [payoutsRes.error, roomsRes.error, gameRoundLogsRes.error] });
//     io.in(data.roomSlug).emit(UPDATE_ACTIVITY_LOG_ROUND, [])
//     io.in(data.roomSlug).emit(UPDATE_ACTIVITY_LOG_WINNER, [])
//   } catch (error) {
//     console.error('Server: clearGame', error);
//   }
// }

// export default clearGame;