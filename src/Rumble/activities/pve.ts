import {ActivityEnvironment, ActivityTypes} from './activity'

const PVE_ACTIVITIES: ActivityTypes[] = [{
  id: "1",
  environment: ActivityEnvironment.PVE,
  description: "PLAYER_0 crafted a spear out of a stick and a rock.",
  amountOfPlayers: 1,
  activityWinner: 0,
  activityLoser: null,
},
{
  id: "2",
  environment: ActivityEnvironment.PVE,
  description: "PLAYER_0 drank infected water and died.",
  amountOfPlayers: 1,
  activityWinner: null,
  activityLoser: 0,
},
{
  id: "6",
  environment: ActivityEnvironment.PVE,
  description: "PLAYER_0 and PLAYER_1 tried to start a fire to stay warm using their own bodies as tinder.",
  amountOfPlayers: 2,
  activityWinner: null,
  activityLoser: [0,1],
}]

export default PVE_ACTIVITIES;