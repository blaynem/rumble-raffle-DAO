import {ActivityEnvironment, ActivityTypes} from '../types/activity'

const REVIVE_ACTIVITIES: ActivityTypes[] = [{
  id: "93d81cc0-07d8-4c2d-ae0a-c277e304a8b6",
  environment: ActivityEnvironment.PVE,
  description: "The population of heave just decreased, because PLAYER_0 is back!",
  amountOfPlayers: 1,
  activityWinner: 0,
  activityLoser: null,
},
{
  id: "e8394d9b-9049-4688-9eef-70f734becdcd",
  environment: ActivityEnvironment.PVE,
  description: "PLAYER_0 has risen from the dead. Is that a zombie?",
  amountOfPlayers: 1,
  activityWinner: null,
  activityLoser: 0,
}]

export default REVIVE_ACTIVITIES;