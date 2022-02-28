import {ActivityTypes, ActivityEnvironment} from '../types/activity'

const PVP_ACTIVITIES: ActivityTypes[] = [{
  id: "3",
  environment: ActivityEnvironment.PVP,
  description: "PLAYER_0 killed PLAYER_1 with a knife.",
  amountOfPlayers: 2,
  activityWinner: 0,
  activityLoser: 1,
}, {
  id: "4",
  environment: ActivityEnvironment.PVP,
  description: "PLAYER_0 and PLAYER_1 teamed up and ate PLAYER_2 alive.",
  amountOfPlayers: 3,
  activityWinner: [0,1],
  activityLoser: 2,
}]

export default PVP_ACTIVITIES;