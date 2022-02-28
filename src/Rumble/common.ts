import { ActivityTypes, PlayerType, allPlayersObj } from './types';
/**
 * Functions needed:
 * - Helper function that picks an activity and returns the amount of players required.
 * - Helper function that creates the activity information based on players that are joining.
 */

// Gets a random amount of items from the select array.
export const getRandomItemsFromArr = (arr: any[], n: number): any => {
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
 * Picks an activity from all available activities.
 * @param options - list of available activities
 * @returns 
 */
export const pickActivity = (options: ActivityTypes[]): ActivityTypes => {
  return getRandomItemsFromArr(options, 1)[0];
}

export const doActivity = (activity: ActivityTypes, players: PlayerType[]) => {
  console.log(activity, players);
}

export const getAllPlayersAsArr = (ids: string[], obj: allPlayersObj): PlayerType[] => {
  return ids.map(id => obj[id]);
}