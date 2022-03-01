import { ActivityTypes, PlayerType, RoundActivityLogType, allPlayersObj } from './types';
/**
 * Functions needed:
 * - Helper function that picks an activity and returns the amount of players required.
 * - Helper function that creates the activity information based on players that are joining.
 */

/**
 * Get's number of random items from the given array.
 * Will not repeat items.
 * @param arr - items to choose from
 * @param n - number of items to get
 * @returns an array of items
 */
export const getAmtRandomItemsFromArr = (arr: any[], n: number): any[] => {
  var result = new Array(n),
    len = arr.length,
    taken = new Array(len);
  if (n > len)
    throw new RangeError("getRandom: more elements taken than available");
  while (n--) {
    var x = Math.floor(Math.random() * len);
    result[n] = arr[x in taken ? taken[x] : x];
    taken[x] = --len in taken ? taken[len] : len;
  }
  return result;
}

/**
 * Picks an activity from all available activities based on how many players there are left.
 * @param options - list of available activities
 * @returns 
 */
export const pickActivity = (options: ActivityTypes[], minimumPlayerAmount: number, maxDeaths?: number): ActivityTypes => {
  // We only want to give options where there are enough players.
  let filteredOptions = options.filter(({ amountOfPlayers }) => amountOfPlayers <= minimumPlayerAmount)
  // getAmtRandomItemsFromArr returns an array, so we get the first item.
  if (maxDeaths) {
    filteredOptions = [...filteredOptions].filter(({ activityLoser }) => {
      if (activityLoser === null) return true;
      return activityLoser.length <= maxDeaths
    })
  }
  return getAmtRandomItemsFromArr(filteredOptions, 1)[0];
}

/**
 * Creates an array of player ids selected from the given indexes.
 * @param indexes - index of player in the player ID list
 * @param playerIds - array of player ids
 * @returns array of player ids
 */
const getPlayersFromIndex = (
  indexes: number[] | null,
  playerIds: string[]
): string[] | null => {
  return indexes === null ? null : indexes.map(index => playerIds[index]);
}


/**
 * Gets the winners, losers, and description of the activity for the given selected activity.
 * @param activity
 * @param playerIds 
 * @returns 
 */
export const doActivity = (
  activity: ActivityTypes,
  playerIds: string[],
  createContentCallback: (activity: ActivityTypes, playerIds: string[]) => string
): RoundActivityLogType => {
  const { activityLoser, activityWinner, id } = activity;
  const winners = getPlayersFromIndex(activityWinner, playerIds);
  const losers = getPlayersFromIndex(activityLoser, playerIds);

  let killCount: {[playerId: string]: number} = {};
  if (activity.killCounts) {
    activity.killCounts.forEach((val, index) => killCount[playerIds[index]] = val);
  }

  return {
    activity,
    activityId: id,
    participants: playerIds,
    winners,
    losers,
    content: createContentCallback(activity, playerIds),
    killCount
  }
}

/**
 * Gets all selected players based on given ids.
 * @param ids - array of all player ids
 * @param obj - obj holding all players
 * @returns an array of players
 */
export const getPlayersFromIds = (ids: string[], obj: allPlayersObj): PlayerType[] => {
  return ids.map(id => obj[id]);
}

/**
 * Determines if an event occurs based on the number passed into it.
 * ex: chance of event is 30, will get a random number and if the number is less than 30, returns true or false.
 * @param chanceEventOccurs - chance event occurs out of 100
 * @returns 
 */
export const doesEventOccur = (chanceEventOccurs: number): boolean => {
  return chanceEventOccurs >= Math.floor(
    Math.random() * (101)
  )
}