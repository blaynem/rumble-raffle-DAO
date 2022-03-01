import {ActivityEnvironment, ActivityTypes} from '../types/activity'

const PVE_ACTIVITIES: ActivityTypes[] = [
  {
  id: "92643c20-ae46-4a68-95f4-b3ebbb449777",
  environment: ActivityEnvironment.PVE,
  description: "PLAYER_0 crafted a spear out of a stick and a rock.",
  amountOfPlayers: 1,
  activityWinner: [0],
  activityLoser: null,
},
{
  id: "1fb3a9e6-7fac-4bee-921f-e5d3f7b8b958",
  environment: ActivityEnvironment.PVE,
  description: "PLAYER_0 drank infected water and died.",
  amountOfPlayers: 1,
  activityWinner: null,
  activityLoser: [0],
},
{
  id: "46756a5a-c804-4bba-90d0-52c34cfd79da",
  environment: ActivityEnvironment.PVE,
  description: "PLAYER_0 and PLAYER_1 tried to start a fire to stay warm using their own bodies as tinder.",
  amountOfPlayers: 2,
  activityWinner: null,
  activityLoser: [0,1],
}]

export default PVE_ACTIVITIES;