import { Prisma } from '.prisma/client';
import { ActivityLogType, GameEndType } from '@rumble-raffle-dao/rumble/types';
import { GameRoundLogsOmitId, EntireGameLog, SingleActivity, RoundActivityLog, PickFromPlayers, RoomDataType } from '@rumble-raffle-dao/types';

/**
 * The Rumble killCount type = { [playerId: string]: number }
 * while the Activity log kill_count type = { [playerId: string]: Decimal }
 * We must map through those.
 */
const mapRumbleKillCountToDecimals = (killCount: ActivityLogType['killCount']): SingleActivity['kill_count'] => {
  const tempObj: SingleActivity['kill_count'] = {};
  Object.entries(killCount).map(([key, val]) => tempObj[key] = new Prisma.Decimal(val));
  return tempObj;
}

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
        .forEach(player => {
          const playerData = gamePlayers.find(p => p.id === player.id)
          winners.push({ ...player, id: player.id, discord_tag: playerData.discord_tag })
        })
      return;
    };
    const activities: SingleActivity[] = round.activityLog.map(({ activity, activityId, participants, killCount }, index) => ({
      activity_order: index,
      description: activity.description,
      environment: activity.environment,
      id: activityId,
      participants: participants.map(player => gamePlayers.find(p => p.id === player)),
      kill_count: mapRumbleKillCountToDecimals(killCount),
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

export const parseActivityLogForDbPut = (gameLog: EntireGameLog, data: RoomDataType): GameRoundLogsOmitId[] => {
  const allActivitiesInGame: GameRoundLogsOmitId[] = [];

  gameLog.rounds.forEach(round => {
    round.activities.forEach((item, index) => {
      const activityInRound: GameRoundLogsOmitId = {
        room_params_id: data.room.params_id,
        participants: item.participants.map(player => player.id),
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