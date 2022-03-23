import { GameEndType } from "@rumble-raffle-dao/rumble";
import { definitions, PickFromPlayers } from "../../types";

// The entire games log.
type EntireGameLog = {
  rounds: RoundActivityLog[];
  winners: PickFromPlayers[];
}

// The collection of activities that happens in a given game.
type RoundActivityLog = {
  // Activities that have happened in this round.
  activities: SingleActivity[];
  // What round of the acitvity log this is.
  counter: number;
  // Id's of all players remaining.
  playersRemaining: string[];
}

// A single activity that happens in a given round.
type SingleActivity = {
  // Description of the activity that happens. Ex: "PLAYER_0 drank infected water and died."
  description: definitions['activities']['description'];
  // Whether it is PVE, PVP, or REVIVE 
  environment: definitions['activities']['environment']
  // Id of the activity
  id: definitions['activities']['id'];
  // Participants of the activity
  participants: PickFromPlayers[];
}

/**
 * Parse the activity log that comes back from the Rumble game to a more readable view.
 * @param gameActivityLogs 
 * @param gamePlayers 
 * @returns 
 */
export const parseActivityLog = (gameActivityLogs: GameEndType['gameActivityLogs'], gamePlayers: PickFromPlayers[]): EntireGameLog => {
  let winners: EntireGameLog['winners'] = [];
  const rounds: EntireGameLog['rounds'] = gameActivityLogs.map(round => {
    // If winner is in round, that means its the WinnerLog.
    if ('winner' in round) {
      [round.winner, ...round.runnerUps]
        .forEach(player => winners.push({ ...player, public_address: player.id }))
      return;
    };
    const activities: SingleActivity[] = round.activityLog.map(({ activity, activityId, participants }) => ({
      description: activity.description,
      environment: activity.environment,
      id: activityId,
      participants: participants.map(player => gamePlayers.find(p => p.public_address === player)),
    }));
    const roundLog: RoundActivityLog = {
      activities,
      counter: round.roundCounter,
      playersRemaining: round.playersRemainingIds
    }
    return roundLog;
  }).filter(log => log !== undefined);
  return {
    rounds, winners
  };
}