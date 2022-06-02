import { ActivityTypes } from "@rumble-raffle-dao/rumble"

const PVP = [
  "PLAYER_0 made fried chicken out of PLAYER_1.",
  "PLAYER_0 rubbed some dirt into PLAYER_1's eyes.",
  "PLAYER_0 was drowned in a bird bath by PLAYER_1.",
  "PLAYER_0 was sick of waking up to PLAYER_1's incessant singing, so they shot them with their air rifle.",
  "PLAYER_0 made a wrong turn and ended up in a cock fight. Killed by PLAYER_1, the big dangerous cock.",
  "PLAYER_0 tried to shoot PLAYER_1 but the gun exploded, killing them instead.",
  "In the middle of the night, PLAYER_0 stabbed their friend PLAYER_1 with a stick.",
  "PLAYER_0 was so hungry they ate PLAYER_1.",
  "PLAYER_0 used kirby to suck PLAYER_1 out of existence.",
  "PLAYER_0 bored PLAYER_1 to death.",
  "PLAYER_0 baked PLAYER_1 some special brownies that exploded upon consumption.",
]

const PVP_OBJ: Omit<ActivityTypes, 'id' | 'description'> = {
  "environment": "PVP",
  "amountOfPlayers": 2,
  "activityWinner": [0],
  "activityLoser": [1],
  "killCounts": [1, 0]
}

export default {
  description: PVP,
  dataObject: PVP_OBJ
}