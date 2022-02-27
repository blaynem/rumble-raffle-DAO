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
