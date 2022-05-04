/**
 * Everything here is just an idea for now.
 */

const weapon_attributes = {
  type: [
    { value: 'Short Sword', weight: 30 },
    { value: 'Long Sword', weight: 10 },
    { value: 'Mace', weight: 30 },
    { value: 'Dagger', weight: 10 },
    { value: 'Sword and Board', weight: 20 },
  ],
  shiny: [
    { value: false, weight: 85 },
    { value: true, weight: 15 }
  ],
}

type RarityStats = {
  /**
   * The lowest a stat value can be
   */
  min: number;
  /**
   * The highest a stat value can be
   */
  max: number;
  /**
   * Whether the stat value is a number or percent
   */
  type: 'number' | 'percent'
  /**
   * Multiplier to be added to the selected value
   */
  shiny: number;
}

type Rarities = {
  value: 'common' | 'rare' | 'epic' | 'legendary';
  stats: {
    joinGamePay: RarityStats;
    rewardPerKill: RarityStats;
    chanceOfPayPerKill: RarityStats;
    payChanceIncrease: RarityStats;
    winGame: RarityStats;
  }
}

const weapon_rarities: Rarities[] = [
  {
    value: 'common',
    stats: {
      joinGamePay: { min: 1, max: 1, type: 'number', shiny: 2 },
      rewardPerKill: { min: 0, max: 0, type: 'number', shiny: 1.5 },
      chanceOfPayPerKill: { min: 0, max: 0, type: 'percent', shiny: 0 },
      payChanceIncrease: { min: 0, max: 0, type: 'number', shiny: 0 },
      winGame: { min: 2, max: 2, type: 'number', shiny: 2 }
    }
  },
  {
    value: 'rare',
    stats: {
      joinGamePay: { min: 1, max: 1, type: 'number', shiny: 2 },
      rewardPerKill: { min: 1, max: 1, type: 'number', shiny: 1.5 },
      chanceOfPayPerKill: { min: .1, max: .3, type: 'percent', shiny: .1 },
      payChanceIncrease: { min: 2, max: 8, type: 'number', shiny: 0 },
      winGame: { min: 2, max: 4, type: 'number', shiny: 2 }
    }
  },
  {
    value: 'epic',
    stats: {
      joinGamePay: { min: 1, max: 1, type: 'number', shiny: 2 },
      rewardPerKill: { min: 2, max: 2, type: 'number', shiny: 1.5 },
      chanceOfPayPerKill: { min: .35, max: .55, type: 'percent', shiny: .1 },
      payChanceIncrease: { min: 3, max: 9, type: 'number', shiny: 0 },
      winGame: { min: 3, max: 5, type: 'number', shiny: 2 }
    }
  },
  {
    value: 'legendary',
    stats: {
      joinGamePay: { min: 1, max: 1, type: 'number', shiny: 2 },
      rewardPerKill: { min: 3, max: 3, type: 'number', shiny: 1.5 },
      chanceOfPayPerKill: { min: .55, max: .75, type: 'percent', shiny: .1 },
      payChanceIncrease: { min: 7, max: 11, type: 'number', shiny: 0 },
      winGame: { min: 6, max: 10, type: 'number', shiny: 2 }
    }
  },
]
