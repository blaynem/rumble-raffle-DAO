const PVE_DESCRIPTION_DEATH_MULTIPLAYER = [
  "What started as a nice gesture ended in disaster, neither PLAYER_0 or PLAYER_1 knew how to cook.",
  "What started as a fun idea ended in disaster, neither PLAYER_0 or PLAYER_1 knew how to survive in the wild.",
  "PLAYER_0 and PLAYER_1 decided to eat some random mushrooms they found. They were poisonous.",
  "PLAYER_0 and PLAYER_1 decided to eat some random mushrooms they found. Though they both turned into birds: a penguin, and a Boeing 737 Max; neither could fly."
];

const PVE_object_DEATH_MULTIPLAYER = {
  "environment": "PVE",
  "amountOfPlayers": 2,
  "activityWinner": null,
  "activityLoser": [0, 1],
  "killCounts": null
}

export default {
  description: PVE_DESCRIPTION_DEATH_MULTIPLAYER,
  dataObject: PVE_object_DEATH_MULTIPLAYER
}