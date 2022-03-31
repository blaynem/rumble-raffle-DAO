/**
 * Used to determine how the prize payouts will be split amongst players, etc.
 */
export type PrizeSplitType = {
  /**
   * Alternative split that will be delegated out.
   * This can be sent wherever the game creator decides.
   * Default Value is: .5%
   */
  altSplit: number;
  /**
   * Split to be given to the creators of RumbleRaffleDAO
   * Default Value is: .5%
   */
  creatorSplit: number;
  /**
   * Split for winner of the raffle.
   * Default Value is: 50%
   */
  firstPlace: number;
  /**
   * Split for second place survivor.
   * Default Value is: 15%
   */
  secondPlace: number;
  /**
   * Split for third place survivor.
   * Default Value is: 5%
   */
  thirdPlace: number;
  /**
   * Split that will be designated to kills.
   * The actual kill value will be calculated based on totalPrize and amtPlayers
   * ex: totalPrize = 1000, amtPlayers = 100, killPercent = 20%
   * Formula: (totalPrize * (killPercent / 100)) / amtPlayers 
   * Kill Value = 2.
   * 
   * Default Value is: 20%
   */
  kills: number;
}

/**
 * Interface for the actual values of the prize split.
 * 
 * Ex: If TotalPrize is 1000, and the winners cut is 50%, PrizeValue.firstPlace = 500.
 */
export interface PrizeValuesType extends PrizeSplitType {
  /**
   * Total prize value
   */
  totalPrize: number;
}

/**
 * This will return the actual values that are being paid out on completion of the game.
 */
export type PrizePayouts = {
  /**
   * The split of the prize for alternative cause.
   * Ex: Stakers 
   */
  altSplit: number;
  /**
   * Split to be given to the creators of RumbleRaffleDAO
   */
  creatorSplit: number;
  /**
   * Prize payout for the winner.
   */
  winner: number;
  /**
   * Prize payout for second place.
   */
  secondPlace: number;
  /**
   * Prize payout for third place.
   */
  thirdPlace: number;
  /**
   * Prize payout for all other individuals that had kills.
   */
  kills: { [playerId: string]: number };
  /**
   * Prize winnings remaining.
   * Typically this will happen because people may die in pve round, which doesn't result in a kill bounty.
   */
  remainder: number;
  /**
   * Total prize paid out
   */
  total: number;
}