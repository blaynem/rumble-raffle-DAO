import {ActivityEnvironment, ActivityTypes} from '../types/activity'

const REVIVE_ACTIVITIES: ActivityTypes[] = [{
  id: "8",
  environment: ActivityEnvironment.PVE,
  description: "The population of heave just decreased, because PLAYER_0 is back!",
  amountOfPlayers: 1,
  activityWinner: 0,
  activityLoser: null,
},
{
  id: "9",
  environment: ActivityEnvironment.PVE,
  description: "PLAYER_0 has risen from the dead. Is that a zombie?",
  amountOfPlayers: 1,
  activityWinner: null,
  activityLoser: 0,
}]

export default REVIVE_ACTIVITIES;