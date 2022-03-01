import type { PlayerType, PrizeValuesType, ActivityTypes, allPlayersObj, RoundActivityLogType, ActivityLogType } from './types';
import { PVE_ACTIVITIES, PVP_ACTIVITIES, REVIVE_ACTIVITIES } from './activities';
import { doActivity, pickActivity, getAmtRandomItemsFromArr, getPlayersFromIds, doesEventOccur } from './common';

/**
 * TODO:
 * 
 * Keep track of all kills
 * Hook up the activity log to display
 * Figure out prize split correctly for kills?
 * Make this go through a timer somehow?
 * 
 * Next Huge Steps:
 * - Getting this program to run in the cloud and update all players at the same time. Websockts? idk
 * - Hooking up wallets / collecting prizes
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
  activityLogs: ActivityLogType[];
  /**
   * The maximum amount of activities a user should be able to participate in each round.
   * Excluding revives.
   * Default is 2.
   */
  maxActivitiesPerRound: number;
  // Has game already been started.
  gameStarted: boolean;
  // All players still in the game
  playersRemainingIds: string[];
  // Players who have been slain.
  playersSlainIds: string[];
  // What round we are on.
  roundCounter: number;

  constructor() {
    this.activities = []
    this.chanceOfPve = 30;
    this.chanceOfRevive = 5;
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
    this.maxActivitiesPerRound = 2;
    this.playersRemainingIds = [];
    this.playersSlainIds = [];
    this.roundCounter = 0;
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
  /**
   * Remove a player from the rumble.
   * @param playerId - playerID to remove
   * @returns - the remaining players
   */
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
  /**
   * Sets the total amount of players and calls setPrize values.
   * @returns All the players
   */
  setPlayers(): PlayerType[] {
    this.totalPlayers = this.allPlayerIds.length;
    this.setPrizeValues()

    return getPlayersFromIds(this.allPlayerIds, this.allPlayers)
  }
  /**
   * Sets the prize values based on the predetermined prize split.
   */
  setPrizeValues() {
    const totalPrize = this.totalPlayers * this.entryPrice;
    const prizes = getPrizeSplit(totalPrize);

    this.prizes = prizes;
    this.totalPrize = totalPrize;
  }
  /**
   * Getter for the prize information.
   * @returns all prizes
   */
  getPrizes(): PrizeValuesType {
    return this.prizes;
  }
  
  /**
   * Starts the rumble.
   * Will not fire if the game has already started.
   */
  startGame() {
    if (this.gameStarted) {
      console.log('----GAME ALREADY STARTED----')
      return;
    }
    this.activityLogs = [];
    this.playersRemainingIds = [...this.allPlayerIds]
    this.playersSlainIds = [];
    this.gameStarted = true;

    // First round fired
    this.createRound();
  }
  /**
   * Will continue to the next round.
   * If the game hasn't started yet, will do nothing.
   */
  nextRound() {
    if (!this.gameStarted) {
      console.log('----GAME HAS NOT STARTED YET----')
      return;
    }
    // Creates and does the next round.
    this.createRound();
  }
  /**
   * Clears all the activity logs and restarts the game.
   */
  clearGame() {
    this.activityLogs = [];
    this.playersRemainingIds = []
    this.playersSlainIds = [];
    this.gameStarted = false;
    this.roundCounter = 0;
  };

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
  createRound() {
    if (this.playersRemainingIds.length === 1) {
      // Don't do anything because theres no one left.
      console.log('--createRound--AINT DOIN SHIT NO ONE LEFT');
      return;
    }
    this.roundCounter = this.roundCounter += 1;
    const timesPlayedThisRound: { [id: string]: number } = {};
    let availablePlayerIds: string[] = [...this.playersRemainingIds];
    let deadPlayerIds: string[] = [...this.playersSlainIds];
    const roundActivityLog: RoundActivityLogType[] = [];
    
    // Will only revive if there are any dead players.
    const playerRevives = doesEventOccur(this.chanceOfRevive) && deadPlayerIds.length > 0;
    
    // TODO: Determine how long this should run for.
    // Will need to do a loop to create multiple events. Will also need to check and make sure there are enough people to do the next event.
    for (let i = 0; i < 2; i++) {
      // Filtering out players that have already played more than the maxActivitiesPerRound allowed.
      const filterRepeatPlayers = availablePlayerIds.filter(id => {
        return !timesPlayedThisRound[id] || timesPlayedThisRound[id] >= this.maxActivitiesPerRound
      });

      // We don't want to do anymore activities if players have hit maxActivitiesPerRound
      if (filterRepeatPlayers.length < 1) {
        break;
      }
      // Picks pve or pvp round, will always be pve round if there is only one person currently alive.
      // This only happens if someone will also revive this turn.
      const pveRound = filterRepeatPlayers.length === 1|| doesEventOccur(this.chanceOfPve)
      const chosenActivity = pickActivity(pveRound ? PVE_ACTIVITIES : PVP_ACTIVITIES, filterRepeatPlayers.length);
      // Chooses random players
      const chosenPlayerIds: string[] = getAmtRandomItemsFromArr(filterRepeatPlayers, chosenActivity.amountOfPlayers);

      // Do the activity here
      const activity: RoundActivityLogType = doActivity(chosenActivity, chosenPlayerIds);
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
    }

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
    }

    // ROUND ENDS, NOW WE DO MORE THINGS.
    const roundLog: ActivityLogType = {
      roundActivityLog,
      roundCounter: this.roundCounter,
      playersRemainingIds: availablePlayerIds,
      playersSlainIds: deadPlayerIds,
    }
    this.activityLogs.push(roundLog);
    this.playersRemainingIds = [...availablePlayerIds]
    this.playersSlainIds = [...deadPlayerIds];
  }
  // Get's all the values just for debugging.
  debug() {
    return {
      ...this
    }
  }
}



export default Rumble;