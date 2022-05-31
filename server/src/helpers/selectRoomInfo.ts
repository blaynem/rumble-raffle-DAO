import { Prisma } from ".prisma/client";
import { RoomDataType, EntireGameLog, RoundActivityLog, RoundsType, SingleActivity, PickFromPlayers } from "@rumble-raffle-dao/types";

/**
 * Finds the player by the publicAddress and returns the player object.
 * @param pubAddress - publicAddress to find
 * @param players - all players of the game
 * @returns public_address, name
 */
 const findPlayerByPubAddress = (pubAddress: string, players: PickFromPlayers[]): PickFromPlayers => players.find(player => player.id === pubAddress)

 /**
  * Gets the kill count of a player
  * @param killCounts - array of kill counts for the activity
  * @param players - array of players joined the activity
  * @returns 
  */
 const getKillCountsFromPlayers = (killCounts: Prisma.Decimal[], players: string[]): { [playerId: string]: Prisma.Decimal } => {
   if (killCounts === null) {
     return null;
   }
  //  const killCountConverted = killCounts.map(count => count.toNumber());
   return killCounts?.reduce((
     acc: { [playerId: string]: Prisma.Decimal },
     curr: Prisma.Decimal,
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
 * @param allGameLogs - All activities that happened in a given game
 * @param players - All players that participated in the game
 * @returns {EntireGameLog['rounds']} rounds played in the given game
 */
 const getRoundsData = (allGameLogs: RoundsType[], players: PickFromPlayers[]): EntireGameLog['rounds'] => {
  const rounds: EntireGameLog['rounds'] = []
  // Set a temporary round object
  let tempRoundObj: RoundActivityLog = {
    activities: [],
    round_counter: 0,
    players_remaining: 0,
  };
  // Sort the activities so we make sure the rounds are ordered properly.
  const sorted = [...allGameLogs].sort((a, b) => a.round_counter - b.round_counter)
  // Go through all sorted activities.
  sorted.forEach((round) => {
    /**
     * If round count doesn't match:
     * - We sort the tempRoundObj.activities by activity order.
     * - Then push it to the rounds object.
     */
    if (tempRoundObj.round_counter !== round.round_counter) {
      // Sort the activities by the order in which they happen
      const roundObj: RoundActivityLog = {
        ...tempRoundObj,
        activities: tempRoundObj.activities.sort((a, b) => a.activity_order - b.activity_order)
      }
      rounds.push(roundObj);
      tempRoundObj.round_counter = round.round_counter;
      tempRoundObj.activities = [];
      tempRoundObj.players_remaining = 0;
    }

    // Fill out the activity info
    const singleActivity: SingleActivity = {
      activity_order: round.activity_order,
      description: round.Activity.description,
      environment: round.Activity.environment,
      id: round.activity_id,
      kill_count: getKillCountsFromPlayers(round.Activity.killCounts, round.participants),
      participants: round.participants.map((pubAdd: string) => findPlayerByPubAddress(pubAdd, players))
    }
    // Update the players_remaining
    // Note: We don't have an accurate count between each individual activity. Only for round end.
    tempRoundObj.players_remaining = round.players_remaining
    // Push the activity info to the tempRoundObj round
    tempRoundObj.activities.push(singleActivity)
  })
  // Push the last remaining activity to the rounds arr.
  rounds.push({ ...tempRoundObj });

  return rounds;
}

export const selectRoomInfo = (roomInfo: RoomDataType): RoomDataType => {
  const rounds: EntireGameLog['rounds'] = getRoundsData(roomInfo.gameLogs, roomInfo.players);
  const winners: EntireGameLog['winners'] = roomInfo.params.winners?.map((pubAddress: string) => findPlayerByPubAddress(pubAddress, roomInfo.players));
  return {
    ...roomInfo,
    gameData: {
      winners,
      rounds,
    },
  }
}