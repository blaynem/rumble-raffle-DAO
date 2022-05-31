const PVE_DESCRIPTION_LIVE_MULTIPLAYER = [
  "PLAYER_0 and PLAYER_1 teamed up.",
  "PLAYER_0 and PLAYER_1 shared a nice dinner.",
  "PLAYER_0 found PLAYER_1 pinned by a tree and helped them up.",
  "PLAYER_0 stumbled upon PLAYER_1s camp. They shared a drink and some good conversation.",
]

const PVE_OBJECT_LIVE_MULTIPLAYER = {
  "environment": "PVE",
  "amountOfPlayers": 2,
  "activityWinner": [0, 1],
  "activityLoser": null,
  "killCounts": null
}

export default {
  description: PVE_DESCRIPTION_LIVE_MULTIPLAYER,
  dataObject: PVE_OBJECT_LIVE_MULTIPLAYER
}