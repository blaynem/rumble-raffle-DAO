import type { PlayerType, PrizeValuesType, ActivityTypes, allPlayersObj } from './types';
import { PVE_ACTIVITIES, PVP_ACTIVITIES } from './activities';
import {doActivity, pickActivity, getRandomItemsFromArr, getAllPlayersAsArr} from './common';

/**
 * TODO:
 * 
 * Create a round of the game
 * Helper function for creating the activity event
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

  // All players still in the game
  playersRemainingIds: string[];
  // Players who have been slain.
  playersSlainIds: string[];

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
    this.allPlayerIds = [...this.allPlayerIds, newPlayer.id];
    this.allPlayers = {...this.allPlayers, [newPlayer.id]: newPlayer};

    return this.setPlayers();
  }
  removePlayer(playerId: string): PlayerType[] {
    const newAllPlayersObj = {...this.allPlayers};
    delete newAllPlayersObj[playerId];
    const newAllPlayersIds = [...this.playersRemainingIds].filter((id) => id !== playerId)

    this.allPlayers = newAllPlayersObj
    this.playersRemainingIds = newAllPlayersIds;

    return this.setPlayers();
  }
  setPlayers(): PlayerType[] {
    this.totalPlayers = this.allPlayerIds.length;
    this.setPrizeValues()

    return getAllPlayersAsArr(this.allPlayerIds, this.allPlayers)
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
  createRound() {
    const timesPlayedThisRound = {};
    const availablePlayers: any[] = [...this.playersRemainingIds];
    const deadPlayers = [];

    const pveRound = doesEventOccur(this.chanceOfPve)
    const playerRevives = doesEventOccur(this.chanceOfRevive);

    // Picks pve or pvp round
    const chosenActivity = pickActivity(pveRound ? PVE_ACTIVITIES : PVP_ACTIVITIES);
    const chosenPlayersForActivity: PlayerType[] = getRandomItemsFromArr(availablePlayers, chosenActivity.amountOfPlayers);
    
    
    doActivity(chosenActivity, chosenPlayersForActivity);
  }
  // Get's all the values just for debugging.
  debug() {
    return {
      ...this
    }
  }
}

/**
 * Determines if an event occurs based on the number passed into it.
 * ex: chance of event is 30, will get a random number and if the number is less than 30, returns true or false.
 * @param chanceEventOccurs - chance event occurs out of 100
 * @returns 
 */
const doesEventOccur = (chanceEventOccurs: number): boolean => {
  return chanceEventOccurs >= Math.floor(
    Math.random() * (101)
  )
}

export default Rumble;