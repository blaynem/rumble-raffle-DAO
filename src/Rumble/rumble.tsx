import type { PlayerType, PrizeValuesType, ActivityTypes, allPlayersObj, RoundActivityLogType } from './types';
import { PVE_ACTIVITIES, PVP_ACTIVITIES, REVIVE_ACTIVITIES } from './activities';
import { doActivity, pickActivity, getAmtRandomItemsFromArr, getPlayersFromIds, doesEventOccur } from './common';

/**
 * TODO:
 * 
 * Keep track of all kills
 * 
 * 
 */

const getPrizeSplit = (totalPrize: number): PrizeValuesType => {
  // 20% - for kills
  // 5% - 3rd place
  // 15% - 2nd place
  // 50% - 1st place winner
  // 10% - to stakers
  // TODO: Check the math on the killTotal, not sure if that's correct.
  return {
    kills: totalPrize * .2,
    thirdPlace: totalPrize * .05,
    secondPlace: totalPrize * .15,
    firstPlace: totalPrize * .50,
    altSplit: totalPrize * .1,
    totalPrize,
  }
}

class Rumble {
  activities: ActivityTypes[]
  /**
   * Percent chance of a PVE random. Must be between 0 and 100.
   * Default is 30%
   */
  chanceOfPve: number;
  /**
   * Percent chance of someone to revive. Must be between 0 and 100.
   * Default is 5%
   */
  chanceOfRevive: number;
  // Price in order to join the rumble
  entryPrice: number;
  // Prize values that will be given
  prizes: PrizeValuesType;
  // Total prize to be split
  totalPrize: number;

  // All players of the given game as an object.
  allPlayers: allPlayersObj;
  // All player ids of the given game as an array.
  allPlayerIds: string[];
  // Total amount of players
  totalPlayers: number;

  // Storing the activity logs for each round played.
  activityLogs: RoundActivityLogType[][];
  // Has game already been started.
  gameStarted: boolean;
  // All players still in the game
  playersRemainingIds: string[];
  // Players who have been slain.
  playersSlainIds: string[];

  constructor() {
    this.activities = []
    this.chanceOfPve = 30;
    this.chanceOfRevive = 95;
    this.entryPrice = 10;
    this.prizes = getPrizeSplit(0);
    this.totalPrize = 0;

    // Used before starting
    this.allPlayers = {};
    this.allPlayerIds = [];
    this.totalPlayers = 0;

    // Used during play
    this.activityLogs = [];
    this.gameStarted = false;
    this.playersRemainingIds = [];
    this.playersSlainIds = [];
  }
  /**
   * On add player we want to:
   * - Add the player ID to playersRemainingIds arr
   * - Add player to allPlayers object
   * - Call setPlayers method
   * @param newPlayer 
   * @returns 
   */
  addPlayer(newPlayer: PlayerType): PlayerType[] {
    if (this.gameStarted) {
      console.log('----GAME ALREADY STARTED----')
      return this.setPlayers();
    }
    this.allPlayerIds = [...this.allPlayerIds, newPlayer.id];
    this.allPlayers = { ...this.allPlayers, [newPlayer.id]: newPlayer };

    return this.setPlayers();
  }
  removePlayer(playerId: string): PlayerType[] {
    if (this.gameStarted) {
      console.log('----GAME ALREADY STARTED----')
      return this.setPlayers();
    }
    const newAllPlayersObj = { ...this.allPlayers };
    delete newAllPlayersObj[playerId];

    const newAllPlayersIds = [...this.allPlayerIds].filter((id) => id !== playerId)

    this.allPlayers = newAllPlayersObj
    this.allPlayerIds = newAllPlayersIds;

    return this.setPlayers();
  }
  setPlayers(): PlayerType[] {
    this.totalPlayers = this.allPlayerIds.length;
    this.setPrizeValues()

    return getPlayersFromIds(this.allPlayerIds, this.allPlayers)
  }
  setPrizeValues() {
    const totalPrize = this.totalPlayers * this.entryPrice;
    const prizes = getPrizeSplit(totalPrize);

    this.prizes = prizes;
    this.totalPrize = totalPrize;
  }
  getPrizes(): PrizeValuesType {
    return this.prizes;
  }
  /**
   * Creates a round of activites that will happen.
   * 
   * Select an activity to do: PVE / PVP + Amount of players needed
   * - Determined by chanceOfPve
   * Picks random players to do activity, excluding those with "timesPlayedThisRound" >= 2
   * After activity happens we will:
   * - increase any players "timesPlayedThisRound" by 1, max of 2.
   * - place alive players in "availablePlayers" arr
   * - place dead players in "deadPlayers" arr
   * Very end of the round we will:
   * - Add all local deadPlayers to the main deadPlayers list
   * - Check chanceOfRevive and revive one player from the main deadPlayers list
   */
  startGame() {
    this.activityLogs = [];
    this.playersRemainingIds = [...this.allPlayerIds]
    this.playersSlainIds = [];
    this.gameStarted = true;

    // First round fired
    this.createRound();
  }
  nextRound() {
    // Does the next round.
    this.createRound();
    if (this.playersRemainingIds.length === 1) {
      console.log('---GAME ENDED----');
    }
  }
  clearGame() {
    this.activityLogs = [];
    this.playersRemainingIds = []
    this.playersSlainIds = [];
    this.gameStarted = false;
  };
  createRound() {
    if (this.playersRemainingIds.length === 1) {
      // Don't do anything because theres no one left.
      console.log('--createRound--AINT DOIN SHIT NO ONE LEFT');
      return;
    }
    const timesPlayedThisRound: { [id: string]: number } = {};
    let availablePlayerIds: string[] = [...this.playersRemainingIds];
    let deadPlayerIds: string[] = [...this.playersSlainIds];
    const roundActivityLog: RoundActivityLogType[] = [];
    
    // Will only revive if there are any dead players.
    const playerRevives = doesEventOccur(this.chanceOfRevive) && deadPlayerIds.length > 0;
    console.log('---test-1', {availablePlayerIds, deadPlayerIds, playerRevives});
    
    // TODO: Determine how long this should run for.
    // Will need to do a loop to create multiple events. Will also need to check and make sure there are enough people to do the next event.
    for (let i = 0; i < 2; i++) {
      /**
       * We want to skip pve / pvp potential deaths of the last survivor if:
       * - This is the last person alive &&
       * - No players will revive - `playerRevives` is false
       */      
      if ((this.playersRemainingIds.length === 1 || availablePlayerIds.length === 1) && !playerRevives) {
        console.log('----GAME SHOULD END----', {playerRevives, availablePlayerIds, deadPlayerIds, ...this});
        break;
      }
      // Picks pve or pvp round, will always be pve round if there is only one person currently alive.
      // This only happens if someone will also revive this turn.
      const pveRound = this.playersRemainingIds.length === 1|| doesEventOccur(this.chanceOfPve)
      console.log(`---forloop---start---${i}`, {availablePlayerIds, deadPlayerIds, roundActivityLog, playerRevives});
      const chosenActivity = pickActivity(pveRound ? PVE_ACTIVITIES : PVP_ACTIVITIES, availablePlayerIds.length);
      console.log(`----forloop---chosenActivity`, chosenActivity)
      // Chooses random players
      // TODO: DONT ALLOW PLAYERS TO PLAY MORE THAN TWICE A ROUND timesPlayedThisRound.
      const chosenPlayerIds: string[] = getAmtRandomItemsFromArr(availablePlayerIds, chosenActivity.amountOfPlayers);

      // Do the activity here
      const activity: RoundActivityLogType = doActivity(chosenActivity, chosenPlayerIds);
      console.log(`----forloop---doActivity`, activity)
      // push the activity to the log
      roundActivityLog.push(activity)
      if (activity.losers !== null) {
        // We filter any of the losers
        availablePlayerIds = availablePlayerIds.filter(id => activity.losers!.indexOf(id) < 0)
        // Add them to the deadPlayerIds
        deadPlayerIds.push(...activity.losers);
      }
      activity.participants.forEach(id => {
        // If the id is present in the object, then we increase it by one. If it's not, we set it to 1.
        timesPlayedThisRound[id] ? timesPlayedThisRound[id]++ : timesPlayedThisRound[id] = 1;
      })
      console.log(`---forloop---end---${i}`, {availablePlayerIds, deadPlayerIds, roundActivityLog});
    }

    console.log('---test-2', { availablePlayerIds, deadPlayerIds, timesPlayedThisRound, roundActivityLog, playerRevives });
    if (playerRevives) {
      // Gets the player id we are going to revive.
      const playerToReviveId: string = getAmtRandomItemsFromArr(deadPlayerIds, 1)[0];
      // Add player back into pool.
      availablePlayerIds = [...availablePlayerIds, playerToReviveId];
      deadPlayerIds = deadPlayerIds.filter(id => id !== playerToReviveId);
      // Push the activity log for the revive
      const chosenActivity = pickActivity(REVIVE_ACTIVITIES, availablePlayerIds.length);
      const activity: RoundActivityLogType = doActivity(chosenActivity, [playerToReviveId]);
      roundActivityLog.push(activity);
      console.log('----playerRevives-----', chosenActivity, playerToReviveId);
    }

    // If there's only one player alive they are the winner. We don
    if (availablePlayerIds.length === 1) {
      console.log('---THIS IS THE END-- ', { availablePlayerIds, deadPlayerIds, timesPlayedThisRound, roundActivityLog, playerRevives, thisPlayersRemainingId: this.playersRemainingIds, });
    }

    // ROUND ENDS, NOW WE DO MORE THINGS.
    this.activityLogs = [...this.activityLogs, roundActivityLog]
    this.playersRemainingIds = [...availablePlayerIds]
    this.playersSlainIds = [...deadPlayerIds];
    console.log('---test-3', { availablePlayerIds, deadPlayerIds, timesPlayedThisRound, roundActivityLog, playerRevives, thisPlayersRemainingId: this.playersRemainingIds, });
  }
  // Get's all the values just for debugging.
  debug() {
    return {
      ...this
    }
  }
}



export default Rumble;