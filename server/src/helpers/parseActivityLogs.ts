import { GameEndType } from "@rumble-raffle-dao/rumble";
import {GameRoundLogsOmitId, EntireGameLog, SingleActivity, RoundActivityLog, PickFromPlayers, RoomDataType} from '@rumble-raffle-dao/types/server';

/**
 * Parse the activity log that comes back from the Rumble game to a more readable view for the client.
 * @param gameActivityLogs 
 * @param gamePlayers 
 * @returns {EntireGameLog}
 *  The collection of activities that happens in a given game, and the winners.
 */
export const parseActivityLogForClient = (gameActivityLogs: GameEndType['gameActivityLogs'], gamePlayers: PickFromPlayers[]): EntireGameLog => {
  let winners: EntireGameLog['winners'] = [];
  const rounds: EntireGameLog['rounds'] = gameActivityLogs.map(round => {
    // If winner is in round, that means its the WinnerLog.
    if ('winner' in round) {
      [round.winner, ...round.runnerUps]
        .forEach(player => winners.push({ ...player, public_address: player.id }))
      return;
    };
    const activities: SingleActivity[] = round.activityLog.map(({ activity, activityId, participants }, index) => ({
      activity_order: index,
      description: activity.description,
      environment: activity.environment,
      id: activityId,
      participants: participants.map(player => gamePlayers.find(p => p.public_address === player)),
    }));
    const roundLog: RoundActivityLog = {
      activities,
      round_counter: round.roundCounter,
      players_remaining: round.playersRemainingIds.length
    }
    return roundLog;
  }).filter(log => log !== undefined);
  return {
    rounds, winners
  };
}

export const parseActivityLogForDbPut = (gameLog: EntireGameLog, room: RoomDataType): GameRoundLogsOmitId[] => {
  const allActivitiesInGame: GameRoundLogsOmitId[] = [];

  gameLog.rounds.forEach(round => {
    round.activities.forEach((item, index) => {
      const activityInRound: GameRoundLogsOmitId = {
        room_id: room.id,
        players: item.participants.map(player => player.public_address),
        activity_id: item.id,
        players_remaining: round.players_remaining,
        round_counter: round.round_counter,
        activity_order: index,
      }
      allActivitiesInGame.push(activityInRound);
    })
  })

  return allActivitiesInGame;
}