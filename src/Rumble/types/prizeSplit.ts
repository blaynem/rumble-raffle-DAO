export interface PrizeValuesType {
  /**
   * Split for any kills.
   * 
   * CONCERNS: What if someone revives? How is that split determined?
   */
  kills: number;
  // Split for third place survivor.
  thirdPlace: number;
  // Split for second place survivor.
  secondPlace: number;
  // Split for first place survivor.
  firstPlace: number;
  /**
   * Alternate split that will be delegated out.
   * This can be sent wherever game creator decides.
   */
  altSplit: number;
  // Total prize value
  totalPrize: number;
}

export type PrizePayouts = {
  // Prize payout for all other individuals that had kills.
  otherPayouts: {[playerId: string]: number};
  // Prize payout for the winner.
  winner: number;
  // Prize payout for second place.
  secondPlace: number;
  // Prize payout for third place.
  thirdPlace: number;
  /**
   * The split of the prize for alternative cause.
   * Ex: Stakers 
   */
  altSplit: number;
  // Total prize paid out
  total: number;
}