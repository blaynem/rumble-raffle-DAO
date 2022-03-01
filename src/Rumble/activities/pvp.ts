import {ActivityTypes, ActivityEnvironment} from '../types/activity'

const PVP_ACTIVITIES: ActivityTypes[] = [{
  id: "886f6a3f-b6d3-47ae-a2e5-93b58f9d41ed",
  environment: ActivityEnvironment.PVP,
  description: "PLAYER_0 killed PLAYER_1 with a knife.",
  amountOfPlayers: 2,
  activityWinner: [0],
  activityLoser: [1],
}, {
  id: "b4938abf-4af9-41cd-9b32-848abd6575a0",
  environment: ActivityEnvironment.PVP,
  description: "PLAYER_0 and PLAYER_1 teamed up and ate PLAYER_2 alive.",
  amountOfPlayers: 3,
  activityWinner: [0,1],
  activityLoser: [2],
}]

export default PVP_ACTIVITIES;