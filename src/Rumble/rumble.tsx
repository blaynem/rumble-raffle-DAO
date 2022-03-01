import { v4 as uuidv4 } from 'uuid';
import type { PlayerType, PrizeValuesType, ActivityTypes, allPlayersObj, RoundActivityLogType, ActivityLogType, WinnerLogType } from './types';
import { PVE_ACTIVITIES, PVP_ACTIVITIES, REVIVE_ACTIVITIES } from './activities';
import { doActivity, pickActivity, getAmtRandomItemsFromArr, getPlayersFromIds, doesEventOccur } from './common';

/**
 * TODO:
 * 
 * Figure out prize split correctly for kills?
 * Make this go through a timer somehow?
 * 
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
  /**
   * The maximum amount of activities a user should be able to participate in each round.
   * Excluding revives.
   * Default is 2.
   */
  maxActivitiesPerRound: number;
  
  // All players of the given game as an object.
  allPlayers: allPlayersObj;
  // All player ids of the given game as an array.
  allPlayerIds: string[];
  // Total amount of players
  totalPlayers: number;
  // Total prize to be split
  totalPrize: number;

  // Storing the activity logs for each round played.
  activityLogs: (ActivityLogType | WinnerLogType)[];
  // Total kills in the game
  gameKills: {[playerId: string]: number};
  // The game runner ups (2nd / 3rd).
  gameRunnerUps: PlayerType[] | null;
  // Has game already been started.
  gameStarted: boolean;
  // The game winner.
  gameWinner: PlayerType | null;
  // All players still in the game
  playersRemainingIds: string[];
  // Players who have been slain.
  playersSlainIds: string[];
  // What round we are on.
  roundCounter: number;

  constructor() {
    this.activities = []

    // Defining the params of the game
    this.chanceOfPve = 30;
    this.chanceOfRevive = 5;
    this.entryPrice = 10;
    this.maxActivitiesPerRound = 2;
    this.prizes = getPrizeSplit(0);
    
    // Used before starting
    this.allPlayers = {};
    this.allPlayerIds = [];
    this.totalPlayers = 0;
    this.totalPrize = 0;

    // Used during play
    this.activityLogs = [];
    this.gameKills = {};
    this.gameRunnerUps = null;
    this.gameStarted = false;
    this.gameWinner = null;
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
  private setPlayers(): PlayerType[] {
    this.totalPlayers = this.allPlayerIds.length;
    this.setPrizeValues()

    return getPlayersFromIds(this.allPlayerIds, this.allPlayers)
  }
  /**
   * Sets the prize values based on the predetermined prize split.
   */
  private setPrizeValues() {
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
   * Getter for the activity logs.
   * @returns activity logs
   */
  getActivityLog(): (ActivityLogType | WinnerLogType)[] {
    return this.activityLogs;
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
    // Reset game state.
    this.clearGame();
    // Set some variables for game start.
    this.playersRemainingIds = [...this.allPlayerIds]
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
    // todo: Save the round somewhere?
  }
  /**
   * Clears all the activity logs and restarts the game.
   */
  clearGame() {
    this.activityLogs = [];
    this.gameKills = {};
    this.gameRunnerUps = null;
    this.gameStarted = false;
    this.gameWinner = null;
    this.playersRemainingIds = []
    this.playersSlainIds = [];
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
  private createRound() {
    if (this.playersRemainingIds.length === 1) {
      // Set the game winner and do nothing else.
      this.setGameWinner(this.playersRemainingIds[0]);
      return;
    }
    this.roundCounter = this.roundCounter += 1;
    const timesPlayedThisRound: { [id: string]: number } = {};
    const roundActivityLog: RoundActivityLogType[] = [];

    // Variables that will be altered throughout the round
    let availablePlayerIds: string[] = [...this.playersRemainingIds];
    let deadPlayerIds: string[] = [...this.playersSlainIds];

    // Will only revive if there are any dead players.
    const playerRevives = doesEventOccur(this.chanceOfRevive) && deadPlayerIds.length > 0;

    // TODO: Determine how long this should run for.
    // Will need to do a loop to create multiple events. Will also need to check and make sure there are enough people to do the next event.
    for (let i = 0; i < 2; i++) {
      // Filtering out players that have already played more than the maxActivitiesPerRound allowed.
      const filterRepeatPlayers = availablePlayerIds.filter(id => {
        return !timesPlayedThisRound[id] || timesPlayedThisRound[id] >= this.maxActivitiesPerRound
      });

      // If there is only one player left, we don't want to do anymore activities.
      if (filterRepeatPlayers.length <= 1) {
        break;
      }
      // Picks pve or pvp round, will always be pve round if there is only one person currently alive.
      // This only happens if someone will also revive this turn.
      const pveRound = filterRepeatPlayers.length === 1 || doesEventOccur(this.chanceOfPve)
      // We want to set the maximum deaths to the potential players -1. There always needs to be one player left.
      const chosenActivity = pickActivity(pveRound ? PVE_ACTIVITIES : PVP_ACTIVITIES, filterRepeatPlayers.length, filterRepeatPlayers.length - 1);
      // Chooses random players
      const chosenPlayerIds: string[] = getAmtRandomItemsFromArr(filterRepeatPlayers, chosenActivity.amountOfPlayers);

      // Do the activity here
      const activity: RoundActivityLogType = doActivity(chosenActivity, chosenPlayerIds, this.replaceActivityDescPlaceholders);
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
      // Pick which revive activity it will be.
      const chosenActivity = pickActivity(REVIVE_ACTIVITIES, 1);
      // Push the activity log for the revive
      const activity: RoundActivityLogType = doActivity(chosenActivity, [playerToReviveId], this.replaceActivityDescPlaceholders);
      roundActivityLog.push(activity);
    }

    // ROUND ENDS, NOW WE DO MORE THINGS.
    const roundLog: ActivityLogType = {
      id: uuidv4(),
      playersRemainingIds: availablePlayerIds,
      playersSlainIds: deadPlayerIds,
      roundActivityLog,
      roundCounter: this.roundCounter,
    }
    this.activityLogs.push(roundLog);
    this.playersRemainingIds = [...availablePlayerIds]
    this.playersSlainIds = [...deadPlayerIds];
  }
  /**
   * Sets the game winner and runnerups.
   * @param id 
   * @returns 
   */
  private setGameWinner(id: string) {
    if (this.gameWinner !== null) {
      console.log('---already a winner, clear game');
      return;
    }

    const winner = this.allPlayers[id];

    let runnerUpIds = this.playersSlainIds.length > 2 ? this.playersSlainIds.slice(-2) : this.playersRemainingIds;
    // Added to playersSlain in order of death, so we reverse to get correct 2nd/3rd place
    runnerUpIds = [...runnerUpIds].reverse();
    let runnerUps = runnerUpIds.map(id => this.allPlayers[id]);

    const killCount = this.calculateTotalKillCounts();

    const roundLog: WinnerLogType = {
      id: uuidv4(),
      playersSlainIds: this.playersSlainIds,
      winner,
      winnerId: id,
      runnerUps,
      runnerUpIds,
      killCount
    }

    this.activityLogs.push(roundLog);
    this.gameWinner = winner;
    this.gameRunnerUps = runnerUps;
    this.gameKills = killCount;
  }
  private calculateTotalKillCounts(): { [playerId: string]: number }{
    const totalKillCount: { [playerId: string]: number } = {};
    // Loop through activity logs to get the round
    this.activityLogs.forEach((round: (ActivityLogType | WinnerLogType)) => {
      // If we're at the winner log, we ignore it.
      if ('winner' in round) return;
      // loop through each of the rounds activities
      round.roundActivityLog.forEach((activity: RoundActivityLogType) => {
        // Add up the kills in the kill count object.
        Object.keys(activity.killCount).forEach(playerId => {
          if (totalKillCount[playerId]) {
            totalKillCount[playerId] += activity.killCount[playerId]
          } else {
            totalKillCount[playerId] = activity.killCount[playerId];
          }
        })
      })
    })
    return totalKillCount;
  }
  /**
   * Getter for the game winner and runner ups.
   * @returns the game winner and runner ups.
   */
  getGameWinner(): { winner: PlayerType | null, runnerUps: PlayerType[] | null } {
    return {
      runnerUps: this.gameRunnerUps,
      winner: this.gameWinner,
    }
  }
  // Get's all the values just for debugging.
  debug() {
    return {
      ...this
    }
  }
  /**
   * Helper that replaces the "PLAYER_#" placeholders in activity description with the actual players name.
   * @param activity - given activity
   * @param playerIds - player ids completing the activity
   * @returns the activity description string
   */
  replaceActivityDescPlaceholders = (activity: ActivityTypes, playerIds: string[]): string => {
    const matchPlayerNumber = /(PLAYER_\d+)/ // matches PLAYER_0, PLAYER_12, etc
    const parts = activity.description.split(matchPlayerNumber);

    const replaceNames = parts.map(part => {
      if (part.match(matchPlayerNumber)) {
        const index = Number(part.replace('PLAYER_', ''))
        // Gets the name of the player.
        return this.allPlayers[playerIds[index]].name;
      }
      return part;
    }).join('')
    return replaceNames
  }
  /**
   * Gets the player object by the id
   * @param id - id of player
   * @returns player object
   */
  getPlayerById(id: string): PlayerType {
    // todo: add error if id doesn't match a player.
    return this.allPlayers[id];
  }
}



export default Rumble;