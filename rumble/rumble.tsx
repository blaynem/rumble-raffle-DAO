import { v4 as uuidv4 } from 'uuid';
import type { ActivitiesObjType, PlayerType, PrizeValuesType, PrizeSplitType, ActivityTypes, allPlayersObj, RoundActivityLogType, ActivityLogType, WinnerLogType, GameEndType, PrizePayouts, RumbleInterface } from './types';
import { doActivity, pickActivity, getAmtRandomItemsFromArr, getPlayersFromIds, doesEventOccur, getRandomNumber } from './common';
import { RumbleRaffleInterface, SetupType } from './types/rumble';

/**
 * TODO:
 * 
 * (Maybe?)
 * Characters actually store items that are gathered from pve quests. Ex:
 * - Character makes a spear, has a chance to use a spear for the killing weapon in a later match.
 * - Character find water, that water could have been poisoned (drinking it in another tound kills them)
 * 
 */

/**
 * Numbers are percentages. 10 => 10%, etc.
 * Percentages must be in numbers 0-100 and added together must total 100.
 * 
 * Defaults: 
 * 20% - for kills
 * 50% - 1st place winner
 * 15% - 2nd place
 * 5% - 3rd place
 * 9% - to stakers
 * 1% - to RumbleRaffleDAO
 */
const defaultPrizeSplit: PrizeSplitType = {
  kills: 20,
  thirdPlace: 5,
  secondPlace: 15,
  firstPlace: 50,
  altSplit: 9,
  creatorSplit: 1,
}

const defaultGameActivities = {
  PVE: [],
  PVP: [],
  REVIVE: []
};

const initialGamePayouts = {
  altSplit: 0,
  creatorSplit: 0,
  winner: 0,
  secondPlace: 0,
  thirdPlace: 0,
  kills: {},
  total: 0,
}

const RumbleRaffle: RumbleRaffleInterface = class Rumble implements RumbleInterface {
  activities: ActivitiesObjType

  // Values for setting up the rumble environment
  chanceOfPve: number;
  chanceOfRevive: number;
  entryPrice: number;
  maxActivitiesPerRound: number;
  prizes: PrizeValuesType;
  prizeSplit: PrizeSplitType;

  // Values used before game starts
  allPlayers: allPlayersObj;
  allPlayerIds: string[];
  totalPlayers: number;
  totalPrize: number;

  // Values used when game in play
  activityLogs: (ActivityLogType | WinnerLogType)[];
  gameKills: { [playerId: string]: number };
  gamePayouts: PrizePayouts;
  gameRunnerUps: PlayerType[];
  gameStarted: boolean;
  gameWinner: PlayerType | null;
  playersRemainingIds: string[];
  playersSlainIds: string[];
  roundCounter: number;

  constructor(setup: SetupType = {
    activities: defaultGameActivities,
    initialPlayers: [],
    prizeSplit: defaultPrizeSplit,
  }) {
    this.activities = setup.activities;

    // Defining the params of the game
    this.chanceOfPve = 30;
    this.chanceOfRevive = 5;
    this.entryPrice = 10;
    this.maxActivitiesPerRound = 2;
    this.prizes = {
      altSplit: 0,
      creatorSplit: 0,
      firstPlace: 0,
      secondPlace: 0,
      thirdPlace: 0,
      kills: 0,
      totalPrize: 0,
    };
    this.prizeSplit = setup.prizeSplit;

    // Used before starting
    this.allPlayers = {};
    this.allPlayerIds = [];
    this.totalPlayers = 0;
    this.totalPrize = 0;

    // Used during play
    this.activityLogs = [];
    this.gameKills = {};
    this.gamePayouts = initialGamePayouts;
    this.gameRunnerUps = [];
    this.gameStarted = false;
    this.gameWinner = null;
    this.playersRemainingIds = [];
    this.playersSlainIds = [];
    this.roundCounter = 0;

    this.init(setup);
  }
  /**
   * Initiates the class
   */
  init(setup: SetupType) {
    this.validatePrizeSplit();
    this.addInitialPlayers(setup.initialPlayers);
  }
  /**
   * Allows games to be initialized with initial players
   * @param initialPlayers 
   */
  private addInitialPlayers(initialPlayers: PlayerType[]): PlayerType[] | null {
    const allPlayerIds: string[] = [];
    const allPlayers: allPlayersObj = {};
    initialPlayers.forEach(player => {
      allPlayerIds.push(player.id);
      allPlayers[player.id] = player;
    })
    this.allPlayerIds = allPlayerIds;
    this.allPlayers = allPlayers;

    // Update all the prize values.
    return this.setPlayers();
  }
  /**
   * On add player we want to:
   * - Add the player ID to playersRemainingIds arr
   * - Add player to allPlayers object
   * - Call setPlayers method
   * @param newPlayer 
   * @returns 
   */
  addPlayer(newPlayer: PlayerType): PlayerType[] | null {
    if (this.gameStarted) {
      console.log('----GAME ALREADY STARTED----')
      return null;
    }
    if (this.allPlayerIds.indexOf(newPlayer.id) >= 0) {
      console.log('--PLAYER ALREADY ADDED', newPlayer)
      return null;
    }
    this.allPlayerIds = [...this.allPlayerIds, newPlayer.id];
    this.allPlayers = { ...this.allPlayers, [newPlayer.id]: newPlayer };

    return this.setPlayers();
  }
  // Clears all players from game
  clearPlayers() {
    this.allPlayerIds = [];
    this.allPlayers = {};
  };
  /**
   * Remove a player from the rumble.
   * @param playerId - playerID to remove
   * @returns - the remaining players
   */
  removePlayer(playerId: string): PlayerType[] | null {
    if (this.gameStarted) {
      console.log('----GAME ALREADY STARTED----')
      return null;
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
   * Get all players in the game
   * @returns All players
   */
  getAllPlayers(): PlayerType[] {
    return getPlayersFromIds(this.allPlayerIds, this.allPlayers)
  }
  /**
   * Sets the prize values based on the predetermined prize split.
   */
  private setPrizeValues() {
    const totalPrize = this.totalPlayers * this.entryPrice;
    const prizes = this.calculatePrizeSplit(totalPrize, this.totalPlayers);

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
   * Will complete the game by itself without needing to press next rounds, etc.
   */
  startAutoPlayGame(): Promise<GameEndType> {
    this.startGame();

    // If game hasn't started for some reason, we don't go to nextRound.
    // Game won't start if there are not enough players.
    if (this.gameStarted) {
      while (this.gameWinner === null) {
        this.nextRound();
      }
    }

    return this.gameFinished();
  }

  private gameFinished(): Promise<GameEndType> {
    return new Promise<GameEndType>(resolve => {
      resolve({
        activityLogs: this.activityLogs,
        allPlayers: this.allPlayers,
        gameKills: this.gameKills,
        gamePayouts: this.gamePayouts,
        gameRunnerUps: this.gameRunnerUps,
        gameWinner: this.gameWinner,
        roundCounter: this.roundCounter,
      });
    })
  }

  /**
   * Starts the rumble.
   * Will not fire if the game has already started.
   */
  private startGame() {
    // Do nothing if game has started or there are not enough players.
    if (this.gameStarted || this.allPlayerIds.length < 2) {
      console.log('----start game stopped----', { gameStarted: this.gameStarted, playerIds: this.allPlayerIds })
      return;
    }
    // Reset game state.
    this.restartGame();
    // Set some variables for game start.
    this.playersRemainingIds = [...this.allPlayerIds]
    this.gameStarted = true;
  }
  /**
   * Will continue to the next round.
   * If the game hasn't started yet, will do nothing.
   */
  private nextRound() {
    if (!this.gameStarted) {
      console.log('----GAME HAS NOT STARTED YET----')
      return;
    }
    // Creates and does the next round.
    this.createRound();
  }
  /**
   * Resets activity logs and all game state.
   */
  restartGame(): Promise<GameEndType> {
    this.activityLogs = [];
    this.gameKills = {};
    this.gamePayouts = initialGamePayouts;
    this.gameRunnerUps = [];
    this.gameStarted = false;
    this.gameWinner = null;
    this.playersRemainingIds = []
    this.playersSlainIds = [];
    this.roundCounter = 0;

    return this.gameFinished();
  };

  /**
   * Helper that determines how many activities should be possible to do in a given round.
   * 
   * @param amtPlayers - amount of players left in the game
   * @returns - amount of activities should be possible in a loop
   */
  private getActivityLoopTimes(amtPlayers: number): number {
    if (amtPlayers > 100) {
      // We want a minimum of 10 times, maximum of 17. Idk why 17, we can increase this later.
      return getRandomNumber(7) + 10
    } else if (amtPlayers > 45) {
      // We want a minimum of 5 times, maximum of 12 (5+7). Idk why 12, we can increase this later.
      return getRandomNumber(7) + 5
    }
    // We want a minimum of 2 times, maximum of 6 (2+4). Idk why 6, we can increase this later.
    return getRandomNumber(4) + 2
  }

  /**
   * Creates a round of activites that will happen.
   * 
   * Select an activity to do: PVE / PVP
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

    // Will need to do a loop to create multiple events. Will also need to check and make sure there are enough people to do the next event.
    for (let i = 0; i < this.getActivityLoopTimes(availablePlayerIds.length); i++) {
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
      const chosenActivity = pickActivity(pveRound ? this.activities.PVE : this.activities.PVP, filterRepeatPlayers.length, filterRepeatPlayers.length - 1);
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
      const chosenActivity = pickActivity(this.activities.REVIVE, 1);
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

    let runnerUpIds = this.playersSlainIds.length > 2 ? this.playersSlainIds.slice(-2) : this.playersSlainIds;
    // Added to playersSlain in order of death, so we reverse to get correct 2nd/3rd place
    runnerUpIds = [...runnerUpIds].reverse();
    let runnerUps = runnerUpIds.map(id => this.allPlayers[id]);

    const roundLog: WinnerLogType = {
      id: uuidv4(),
      playersSlainIds: this.playersSlainIds,
      winner,
      winnerId: id,
      runnerUps,
      runnerUpIds,
    }

    this.activityLogs.push(roundLog);
    this.gameWinner = winner;
    this.gameRunnerUps = runnerUps;

    // Set this.gameKills
    this.calculateTotalKillCounts();
    // Set this.gamePayouts
    this.calculatePayouts();
  }

  /**
   * Calculates the total amount of kills that happened during the game.
   * Called by setGameWinner
   */
  private calculateTotalKillCounts() {
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
            activity.killCount[playerId] > 0 && (totalKillCount[playerId] = activity.killCount[playerId]);
          }
        })
      })
    })

    this.gameKills = totalKillCount;
  }

  /**
   * Calculates the payouts for kills, placements, etc.
   * Called by setGameWinner
   */
  private calculatePayouts() {
    /**
     * Since people can die in a pve round, there will be leftover prize money.
     * Remaining prize money will be given out to the altSplit.
     */
    let prizeRemainder = this.prizes.totalPrize;
    const payouts: PrizePayouts = {
      altSplit: 0,
      creatorSplit: 0,
      winner: 0,
      secondPlace: 0,
      thirdPlace: 0,
      kills: {},
      total: this.prizes.totalPrize,
    };

    // RumbleRaffleDAO cut
    payouts.creatorSplit = this.prizes.creatorSplit;
    prizeRemainder -= this.prizes.creatorSplit;

    // First place prize
    payouts.winner = this.prizes.firstPlace
    prizeRemainder -= this.prizes.firstPlace

    // Second place prize
    payouts.secondPlace = this.prizes.secondPlace
    prizeRemainder -= this.prizes.secondPlace

    // Third place prize
    payouts.thirdPlace = this.prizes.thirdPlace
    prizeRemainder -= this.prizes.thirdPlace

    // Loop through all the kills
    Object.keys(this.gameKills).forEach(playerId => {
      // if winner, add win
      if (playerId === this.gameWinner?.id) {
        const killPay = (this.prizes.kills * this.gameKills[playerId])
        payouts.winner += killPay;
        prizeRemainder -= killPay;
        return;
      }
      // if 2nd place 
      if (playerId === this.gameRunnerUps[0]?.id) {
        const killPay = (this.prizes.kills * this.gameKills[playerId])
        payouts.secondPlace += killPay;
        prizeRemainder -= killPay;
        return;
      }
      // if 3rd place
      if (playerId === this.gameRunnerUps[1]?.id) {
        const killPay = (this.prizes.kills * this.gameKills[playerId])
        payouts.thirdPlace += killPay;
        prizeRemainder -= killPay;
        return;
      }
      const killPay = (this.prizes.kills * this.gameKills[playerId])
      // only add them if payout is greater than 0
      killPay > 0 && (payouts.kills[playerId] = killPay)
      prizeRemainder -= killPay;
    })

    // The entire remaining prize goes to the alternate split.
    payouts.altSplit = prizeRemainder;
    this.gamePayouts = payouts;
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
    return this;
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
    return this.allPlayers[id];
  }

  private calculatePrizeSplit(totalPrize: number, totalPlayers: number): PrizeValuesType {
    this.validatePrizeSplit();

    return {
      altSplit: totalPrize * (this.prizeSplit.altSplit / 100),
      creatorSplit: (this.prizeSplit.creatorSplit / 100),
      firstPlace: totalPrize * (this.prizeSplit.firstPlace / 100),
      secondPlace: totalPrize * (this.prizeSplit.secondPlace / 100),
      thirdPlace: totalPrize * (this.prizeSplit.thirdPlace / 100),
      kills: (totalPrize * (this.prizeSplit.kills / 100)) / totalPlayers,
      totalPrize,
    }
  }
  /**
   * Helper function to validate whether the prizeSplit totals to 100 or not.
   */
  private validatePrizeSplit() {
    const total = Object.values(this.prizeSplit).reduce((acc, curr) => curr += acc, 0);
    if (total !== 100) {
      throw new Error("Prize split totals must equal exactly 100.");
    }
  }
}

export default RumbleRaffle;