import { OmegaRoomInterface, RoomDataType, EntireGameLog, PickFromUsers, RoundActivityLog, RoundsType, SingleActivity } from "@rumble-raffle-dao/types";

/**
 * Finds the player by the publicAddress and returns the player object.
 * @param pubAddress - publicAddress to find
 * @param players - all players of the game
 * @returns {PickFromUsers} {public_address, name}
 */
 const findPlayerByPubAddress = (pubAddress: string, players: PickFromUsers[]): PickFromUsers => players.find(player => player.public_address === pubAddress)

 /**
  * Gets the kill count of a player
  * @param killCounts - array of kill counts for the activity
  * @param players - array of players joined the activity
  * @returns 
  */
 const getKillCountsFromPlayers = (killCounts: number[], players: string[]): { [playerId: string]: number } => {
   if (killCounts === null) {
     return null;
   }
   return killCounts?.reduce((
     acc: { [playerId: string]: number },
     curr: number,
     index
   ) => {
     const public_address = players[index] as string;
     return {
       ...acc,
       [public_address]: curr
     }
   }, {})
 }

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
      kill_count: getKillCountsFromPlayers(activity.activity.killCounts as number[], activity.players as string[]),
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

export const selectRoomInfo = (roomInfo: OmegaRoomInterface): RoomDataType => {
  const rounds: EntireGameLog['rounds'] = getRoundsData(roomInfo.game_activities, roomInfo.players);
  const winners: EntireGameLog['winners'] = roomInfo.winners?.map((pubAddress: string) => findPlayerByPubAddress(pubAddress, roomInfo.players));
  return {
    gameData: {
      winners,
      rounds,
    },
    created_by: roomInfo.created_by,
    contract: roomInfo.contract,
    game_completed: roomInfo.game_completed,
    game_started: roomInfo.game_started,
    id: roomInfo.id,
    players: roomInfo.players,
    params: roomInfo.params,
    slug: roomInfo.slug,
  }
}