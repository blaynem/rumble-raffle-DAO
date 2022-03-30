import { GameEndType, PrizeSplitType } from "@rumble-raffle-dao/rumble";
import { PrizePayouts } from "@rumble-raffle-dao/rumble/types";
import {definitions, RoomDataType, PayoutsOmitId, PayoutTemplateType} from '@rumble-raffle-dao/types'

export const selectPrizeSplitFromParams = (params: definitions['room_params']): PrizeSplitType => ({
  altSplit: params.prize_alt_split,
  creatorSplit: params.prize_creator,
  firstPlace: params.prize_first,
  kills: params.prize_kills,
  secondPlace: params.prize_second,
  thirdPlace: params.prize_third,
})

export const payoutTemplate = ({ room, public_address, payment_amount, payment_reason, notes }: PayoutTemplateType): PayoutsOmitId => ({
  public_address,
  payment_amount,
  payment_token_address: room.contract.contract_address,
  payment_token_network_name: room.contract.network_name,
  payment_token_symbol: room.contract.symbol,
  room_id: room.id,
  payment_reason,
  notes,
  // These are not done until a later time.
  payment_completed: false,
  payment_completed_at: null,
  payment_transaction_hash: null,
})

/**
 * Helper function to get the notes of a payout.
 */
export const payoutNotesTemplate = (
  { id, gameKills, gamePayouts }: { id: string; gameKills: GameEndType['gameKills']; gamePayouts: GameEndType['gamePayouts'] },
  extraNotes?: string
) => `${getKillNotes(getKillCount(id, gameKills), getKillPayout(id, gamePayouts))}${extraNotes ? ` ${extraNotes}` : ''}`;

/**
 * Helper function that returns all of the payout information for a game.
 */
export const selectPayoutFromGameData = (
  room: RoomDataType,
  { gameWinner, gameRunnerUps, gameKills, gamePayouts }: GameEndType
): PayoutsOmitId[] => {
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

  // In the future we might not have any second place runner ups.
  if (gameRunnerUps[0]) {
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

  // In the future we might not have any third place runner ups.
  if (gameRunnerUps[1]) {
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

  // Filter all of the winners / runnerups out of the kill payouts list.
  const listOfWinners = payouts.map(obj => obj.public_address);
  const filteredKillIds = Object.keys(gamePayouts.kills).filter(id => listOfWinners.indexOf(id) === -1 );
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

  // Only add this if there is an alt split to payout.
  if (room.params.prize_alt_split > 0) {
    const alternateSplitPayout: PayoutsOmitId = payoutTemplate({
      public_address: room.params.alt_split_address,
      room,
      payment_amount: gamePayouts.altSplit,
      payment_reason: 'alt_split',
      notes: `Alternate split payout of ${gamePayouts.altSplit}`
    });
    // Push the alternate split payout
    payouts.push(alternateSplitPayout);
  }
  // return all the payouts
  return payouts;
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

