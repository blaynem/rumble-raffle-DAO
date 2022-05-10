import { GameEndType } from "@rumble-raffle-dao/rumble/types";
import { RoomDataType, PayoutsOmitId, PayoutTemplateType, PrizePayouts } from '@rumble-raffle-dao/types'

type BetaPayoutTypes = {
  WINNER: number;
  RUNNER_UPS: number[];
  KILLS: number;
  JOIN_GAME: number;
}

/**
 * Variables for the beta payouts.
 * There are all whole numbers, not percentages.
 */
 const BETA_PAYOUTS_VARS: BetaPayoutTypes = {
  WINNER: 5,
  RUNNER_UPS: [0],
  KILLS: 1,
  JOIN_GAME: 1,
}

export const payoutTemplate = ({ room, public_address, payment_amount, payment_reason, notes }: PayoutTemplateType): PayoutsOmitId => ({
  public_address,
  payment_amount,
  payment_reason,
  notes,
  // These are not done until a later time.
  payment_completed: false,
  payment_completed_at: null,
  payment_transaction_hash: null,
  room_id: room.id,
  payment_contract_id: room.contract.contract_address
})

/**
 * Helper function to get the notes of a payout.
 */
export const payoutNotesTemplate = (
  { id, gameKills, gamePayouts }: { id: string; gameKills: GameEndType['gameKills']; gamePayouts: PrizePayouts },
  extraNotes?: string
) => `${getKillNotes(getKillCount(id, gameKills), getKillPayout(id, gamePayouts))}${extraNotes ? ` ${extraNotes}` : ''}`;

/**
 * Helper function that returns all of the payout information for a game.
 */
export const selectPayoutFromGameData = (
  room: RoomDataType,
  { gameWinner, gameRunnerUps, gameKills }: GameEndType
): PayoutsOmitId[] => {
  // Calculates the room payouts
  const gamePayouts = calculatePayouts(gameKills);

  const payouts: PayoutsOmitId[] = [];
  // Create winner payout object
  const winnerPayout: PayoutsOmitId = payoutTemplate({
    public_address: gameWinner.id,
    room,
    payment_amount: gamePayouts.winner + getKillPayout(gameWinner.id, gamePayouts),
    payment_reason: 'winner',
    notes: payoutNotesTemplate({ id: gameWinner.id, gameKills, gamePayouts }, `Winner payout: ${gamePayouts.winner}.`)
  });
  // Push the object to the payouts.
  payouts.push(winnerPayout);

  // Only pay the 2nd place runner up if necessary
  if (BETA_PAYOUTS_VARS.RUNNER_UPS[0] > 0 && gameRunnerUps[0]) {
    // Create second place payout object
    const secondPlacePayout: PayoutsOmitId = payoutTemplate({
      public_address: gameRunnerUps[0].id,
      room,
      payment_amount: gamePayouts.secondPlace + getKillPayout(gameRunnerUps[0].id, gamePayouts),
      payment_reason: 'second',
      notes: payoutNotesTemplate({ id: gameRunnerUps[0].id, gameKills, gamePayouts }, `2nd place payout: ${gamePayouts.secondPlace}.`)
    });
    // Push the second place object to the payouts.
    payouts.push(secondPlacePayout);
  }

  // Only pay the 3rd place runner up if necessary
  if (BETA_PAYOUTS_VARS.RUNNER_UPS[1] > 0 && gameRunnerUps[1]) {
    // Create third place payout object
    const thidPlacePayout: PayoutsOmitId = payoutTemplate({
      public_address: gameRunnerUps[1].id,
      room,
      payment_amount: gamePayouts.thirdPlace + getKillPayout(gameRunnerUps[1].id, gamePayouts),
      payment_reason: 'third',
      notes: payoutNotesTemplate({ id: gameRunnerUps[1].id, gameKills, gamePayouts }, `3rd place payout: ${gamePayouts.thirdPlace}.`)
    });
    // Push the third place object to the payouts.
    payouts.push(thidPlacePayout);
  }

  const listOfWinners = payouts.map(obj => obj.public_address);
  // Filter all of the winners / runnerups out of the kill payouts list.
  const filteredKillIds = Object.keys(gamePayouts.kills).filter(id => listOfWinners.indexOf(id) === -1);
  // Loop through all the payout kills and set the payout data.
  filteredKillIds.forEach(public_address => {
    const killPayout: PayoutsOmitId = payoutTemplate({
      public_address,
      room,
      payment_amount: getKillPayout(public_address, gamePayouts),
      payment_reason: 'kills',
      notes: payoutNotesTemplate({ id: public_address, gameKills, gamePayouts })
    });
    // Push the kill payout
    payouts.push(killPayout);
  })

  // Filter so we only add payouts when there is one.
  return payouts.filter(payout => payout.payment_amount > 0);
}

/**
 * Helper function to get the kill count of a specific player in a given game.
 * @param id - id of player
 * @param gameKills - entire game kills object
 * @returns number of kills gotten
 */
const getKillCount = (id: string, gameKills: GameEndType['gameKills']) => gameKills[id] || 0;

/**
 * Helper function to get the kill payout amount of a specific player in a given game.
 * @param id 
 * @param gamePayouts 
 * @returns 
 */
const getKillPayout = (id: string, gamePayouts: PrizePayouts) => gamePayouts.kills[id] || 0;

/**
 * Helper function to create the kill notes for to save for a player.
 * @param killCount - total amount of kills gotten
 * @param killPayout - total amount paid out for kills
 * @returns kill notes
 */
const getKillNotes = (killCount: number, killPayout: number) => killCount > 0 ? `Total kill payout: ${killPayout}. Total kill count: ${killCount}.` : '';


const calculatePayouts = (gameKills: GameEndType['gameKills']): PrizePayouts => {
  let tempTotal = 0;
  const payouts: PrizePayouts = {
    altSplit: 0,
    creatorSplit: 0,
    winner: 0,
    secondPlace: 0,
    thirdPlace: 0,
    kills: {},
    remainder: 0,
    total: 0,
  };

  // First place prize
  payouts.winner = BETA_PAYOUTS_VARS.WINNER
  tempTotal += BETA_PAYOUTS_VARS.WINNER
  
  // Loop through all the kills
  Object.keys(gameKills).forEach(playerId => {
    const killPay = (BETA_PAYOUTS_VARS.KILLS * gameKills[playerId])
    // only add them if payout is greater than 0
    killPay > 0 && (payouts.kills[playerId] = killPay)
    tempTotal += killPay;
  })

  payouts.total = tempTotal;
  return payouts;
}
