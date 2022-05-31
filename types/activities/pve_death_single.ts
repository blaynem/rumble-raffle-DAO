const PVE_DESCRIPTION_DEATHS = [
  "PLAYER_0 was eaten by a snake.",
  "PLAYER_0 was hit with lag and noclipped into a tree.",
  "PLAYER_0 was hit with lag and noclipped into a boulder.",
  "PLAYER_0 ate too much akla-seltzer and exploded.",
  "PLAYER_0 died drinking purified water.",
  "PLAYER_0 was pecked to death in a 'The Birds'-style flock attack.",
  "PLAYER_0 ate a magical brownie and enjoyed the sunset. The next morning they woke up dead. Says here they were allergic to chocolate.. Oops.",
  "PLAYER_0 became self-aware and decided to quit the game. Can.. can they do that?",
  "PLAYER_0 thinks the bird came before the egg. An egg killed them.",
  "PLAYER_0 was poisoned by a berry.",
  "A boomerang came flying out of nowhere and decapitated PLAYER_0!",
  "After engorging themselves on bird seed, PLAYER_0 exploded.",
  "PLAYER_0 choked on their spit and died.",
  "PLAYER_0 killed themselves.",
  "PLAYER_0 was crushed by a falling log.",
  "PLAYER_0 built a rocket and flew to the moon. Incredible! Too bad they forgot there is no oxygen up there.",
  "PLAYER_0 found a book to read but the words were so intelligent, it confused them to death.",
];

const PVE_OBJECT_DEATHS = {
  "environment": "PVE",
  "amountOfPlayers": 1,
  "activityWinner": null,
  "activityLoser": [0],
  "killCounts": null
}

export default {
  description: PVE_DESCRIPTION_DEATHS,
  dataObject: PVE_OBJECT_DEATHS
}