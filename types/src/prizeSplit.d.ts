import { Prisma } from '.prisma/client'

/**
 * This will return the actual values that are being paid out on completion of the game.
 */
export type PrizePayouts = {
  /**
   * Prize payout for the winner.
   */
  winner: Prisma.Decimal;
  /**
   * Prize payout for all other individuals that had kills.
   */
  kills: { [playerId: string]: Prisma.Decimal };
  /**
   * Total prize paid out
   */
  total: Prisma.Decimal;
}