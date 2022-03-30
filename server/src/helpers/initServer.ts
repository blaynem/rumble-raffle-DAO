import { addNewRoomToMemory } from "./roomRumbleData";
import client from "../client";
import {
  EntireGameLog,
  OmegaRoomInterface,
  PickFromUsers,
  RoomDataType,
  RoundActivityLog,
  RoundsType,
  SingleActivity
} from '@rumble-raffle-dao/types';

/**
 * Finds the player by the publicAddress and returns the player object.
 * @param pubAddress - publicAddress to find
 * @param players - all players of the game
 * @returns {PickFromUsers} {public_address, name}
 */
const findPlayerByPubAddress = (pubAddress: string, players: PickFromUsers[]): PickFromUsers => players.find(player => player.public_address === pubAddress)

/**
 * Loops through all of the activities played in a given game and merges them together into a
 * rounds object to make it easier to display client side.
 * @param allGameActivities - All activities that happened in a given game
 * @param players - All players that participated in the game
 * @returns {EntireGameLog['rounds']} rounds played in the given game
 */
const getRoundsData = (allGameActivities: RoundsType[], players: PickFromUsers[]): EntireGameLog['rounds'] => {
  const rounds: EntireGameLog['rounds'] = []
  // Set a temporary round object
  let tempRoundObj: RoundActivityLog = {
    activities: [],
    round_counter: 0,
    players_remaining: 0,
  };
  // Sort the activities so we make sure the rounds are ordered properly.
  const sorted = [...allGameActivities].sort((a, b) => a.round_counter - b.round_counter)
  // Go through all sorted activities.
  sorted.forEach((activity) => {
    /**
     * If round count doesn't match:
     * - We sort the tempRoundObj.activities by activity order.
     * - Then push it to the rounds object.
     */
    if (tempRoundObj.round_counter !== activity.round_counter) {
      // Sort the activities by the order in which they happen
      const roundObj: RoundActivityLog = {
        ...tempRoundObj,
        activities: tempRoundObj.activities.sort((a, b) => a.activity_order - b.activity_order)
      }
      rounds.push(roundObj);
      tempRoundObj.round_counter = activity.round_counter;
      tempRoundObj.activities = [];
      tempRoundObj.players_remaining = 0;
    }

    // Fill out the activity info
    const singleActivity: SingleActivity = {
      activity_order: activity.activity_order,
      description: activity.activity.description,
      environment: activity.activity.environment,
      id: activity.activity_id,
      participants: activity.players.map((pubAdd: string) => findPlayerByPubAddress(pubAdd, players))
    }
    // Update the players_remaining
    // Note: We don't have an accurate count between each individual activity. Only for round end.
    tempRoundObj.players_remaining = activity.players_remaining
    // Push the activity info to the tempRoundObj round
    tempRoundObj.activities.push(singleActivity)
  })
  // Push the last remaining activity to the rounds arr.
  rounds.push({ ...tempRoundObj });

  return rounds;
}


const selectRoomInfo = (roomInfo: OmegaRoomInterface): RoomDataType => {
  const rounds: EntireGameLog['rounds'] = getRoundsData(roomInfo.game_activities, roomInfo.players);
  const winners: EntireGameLog['winners'] = roomInfo.winners?.map((pubAddress: string) => findPlayerByPubAddress(pubAddress, roomInfo.players));
  return {
    gameData: {
      winners,
      rounds,
    },
    created_by: roomInfo.created_by,
    contract: roomInfo.contract,
    game_started: roomInfo.game_started,
    id: roomInfo.id,
    players: roomInfo.players,
    params: roomInfo.params,
    slug: roomInfo.slug,
  }
}

// todo: check if game was already completed and has stored activity log / winner data.
const InitializeServer = async () => {
  const { data, error } = await client.from<OmegaRoomInterface>('rooms').select(`
    id,
    players:users!players(public_address, name),
    params:params_id(*),
    slug,
    contract:contract_id(*),
    game_started,
    created_by,
    game_activities: game_round_logs(*, activity:activity_id(*)),
    winners
    `)
  if (error) {
    console.error('---error', error);
    return;
  }
  data.forEach(room => {
    const roomToAdd = selectRoomInfo(room)
    addNewRoomToMemory(roomToAdd);
  })
}



export default InitializeServer