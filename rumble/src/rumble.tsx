import { v4 as uuidv4 } from 'uuid';
import type { ActivitiesObjType, PlayerType, ActivityTypes, allPlayersObj, ActivityLogType, RoundActivityLogType, WinnerLogType, GameEndType, RumbleInterface, GameActivityLogsType } from '../types';
import { doActivity, pickActivity, getAmtRandomItemsFromArr, getPlayersFromIds, doesEventOccur, getRandomNumber } from '../common';
import { RumbleRaffleInterface, SetupType } from '../types/rumble';

/**
 * TODO:
 * 
 * (Maybe?)
 * Characters actually store items that are gathered from pve quests. Ex:
 * - Character makes a spear, has a chance to use a spear for the killing weapon in a later match.
 * - Character find water, that water could have been poisoned (drinking it in another tound kills them)
 * 
 */

const defaultGameActivities: ActivitiesObjType = {
  PVE: [],
  PVP: [],
  REVIVE: []
};

const defaultParams: SetupType['params'] = {
  chanceOfPve: 30,
  chanceOfRevive: 5,
}

export const defaultSetup: SetupType = {
  activities: defaultGameActivities,
  params: defaultParams,
  initialPlayers: [],
}

const RumbleRaffle: RumbleRaffleInterface = class Rumble implements RumbleInterface {
  activities: ActivitiesObjType

  // Values for setting up the rumble environment
  chanceOfPve: number;
  chanceOfRevive: number;
  maxActivitiesPerRound: number;

  // Values used before game starts
  allPlayers: allPlayersObj;
  allPlayerIds: string[];
  totalPlayers: number;

  // Values used when game in play
  gameActivityLogs: GameActivityLogsType;
  gameKills: { [playerId: string]: number };
  gameRunnerUps: PlayerType[];
  gameStarted: boolean;
  gameWinner: PlayerType | null;
  playersRemainingIds: string[];
  playersSlainIds: string[];
  roundCounter: number;

  constructor(setup: SetupType = defaultSetup) {
    this.activities = setup.activities;

    // Defining the params of the game
    this.chanceOfPve = setup.params.chanceOfPve;
    this.chanceOfRevive = setup.params.chanceOfRevive;

    this.maxActivitiesPerRound = 2;

    // Used before starting
    this.allPlayers = {};
    this.allPlayerIds = [];
    this.totalPlayers = 0;

    // Used during play
    this.gameActivityLogs = [];
    this.gameKills = {};
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
   * Sets the total amount of players.
   * @returns All the players
   */
  private setPlayers(): PlayerType[] {
    this.totalPlayers = this.allPlayerIds.length;

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
   * Getter for the activity logs.
   * @returns activity logs
   */
  getActivityLog(): GameActivityLogsType {
    return this.gameActivityLogs;
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
        gameActivityLogs: this.gameActivityLogs,
        allPlayers: this.allPlayers,
        gameKills: this.gameKills,
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
    this.gameActivityLogs = [];
    this.gameKills = {};
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
   * amtPlayer  | minimumLoops
   * 0 - 45     | 2
   * 46 - 100   | 5
   * 101 - 200  | 10
   * 201 - 500  | 15
   * 500+       | 20
   * 
   * @param amtPlayers - amount of players left in the game
   * @returns - amount of activities should be possible in a loop
   */
  private getActivityLoopTimes(amtPlayers: number): number {
    if (amtPlayers > 500) {
      // We want a minimum of 20 times, maximum of 30.
      return getRandomNumber(10) + 20
    } else if (amtPlayers > 200) {
      // We want a minimum of 15 times, maximum of 25.
      return getRandomNumber(10) + 15
    } else if (amtPlayers > 100) {
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
   * Picks a pve or pvp round, then does the activity and returns it.
   * @param playerIds - array of player id's
   * @returns {ActivityLogType} The activity log
   */
  private pickAndCreateActivity(playerIds: string[]): ActivityLogType {
    // Picks pve or pvp round, will always be pve round if there is only one person currently alive.
    // This only happens if someone will also revive this turn.
    const pveRound = playerIds.length === 1 || doesEventOccur(this.chanceOfPve)
    // We want to set the maximum deaths to the potential players -1. There always needs to be one player left.
    const chosenActivity = pickActivity(pveRound ? this.activities.PVE : this.activities.PVP, playerIds.length, playerIds.length - 1);
    // Chooses random players
    const chosenPlayerIds: string[] = getAmtRandomItemsFromArr(playerIds, chosenActivity.amountOfPlayers);
    // Do the activity here
    const activity: ActivityLogType = doActivity(chosenActivity, chosenPlayerIds, this.replaceActivityDescPlaceholders);
    
    return activity;
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
    const timesPlayedThisRound: { [id: string]: number } = {};
    const activityLog: ActivityLogType[] = [];

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
      const activity = this.pickAndCreateActivity(filterRepeatPlayers);
      // push the activity to the log
      activityLog.push(activity)

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
      const activity: ActivityLogType = doActivity(chosenActivity, [playerToReviveId], this.replaceActivityDescPlaceholders);
      activityLog.push(activity);
    }

    // ROUND ENDS, NOW WE DO MORE THINGS.
    const roundLog: RoundActivityLogType = {
      id: uuidv4(),
      playersRemainingIds: availablePlayerIds,
      playersSlainIds: deadPlayerIds,
      activityLog,
      roundCounter: this.roundCounter,
    }
    this.gameActivityLogs.push(roundLog);
    this.playersRemainingIds = [...availablePlayerIds]
    this.playersSlainIds = [...deadPlayerIds];
    this.roundCounter = this.roundCounter += 1;
  }
  /**
   * Sets the game winner and runnerups.
   * @param id 
   * @returns 
   */
  private setGameWinner(id: string) {
    const winner = this.allPlayers[id];

    // Added to playersSlain in order of death, so we reverse the array.
    const runnerUpIds = [...this.playersSlainIds].reverse();
    let runnerUps = runnerUpIds.map(id => this.allPlayers[id]);

    const roundLog: WinnerLogType = {
      id: uuidv4(),
      playersSlainIds: this.playersSlainIds,
      winner,
      winnerId: id,
      runnerUps,
      runnerUpIds,
    }

    this.gameActivityLogs.push(roundLog);
    this.gameWinner = winner;
    this.gameRunnerUps = runnerUps;

    // Set this.gameKills
    this.calculateTotalKillCounts();
  }

  /**
   * Calculates the total amount of kills that happened during the game.
   * Called by setGameWinner
   */
  private calculateTotalKillCounts() {
    const totalKillCount: { [playerId: string]: number } = {};
    // Loop through activity logs to get the round
    this.gameActivityLogs.forEach((round: (RoundActivityLogType | WinnerLogType)) => {
      // If we're at the winner log, we ignore it.
      if ('winner' in round) return;
      // loop through each of the rounds activities
      round.activityLog.forEach((activity: ActivityLogType) => {
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
}

export default RumbleRaffle;