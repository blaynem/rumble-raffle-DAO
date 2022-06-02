import { ActivityTypes } from "@rumble-raffle-dao/rumble"

const REVIVE = [
  "PLAYER_0 was rejected from heaven and placed back on the battlefield once more.",
  "The magic 8-ball says PLAYER_0 gets to come back to life.",
  "The devs finally did something! Welcome back PLAYER_0.",
  "There was an overflow error, PLAYER_0 is now back in the game.", 
  "The magic conch demands that PLAYER_0 be given another life. We don't argue with the conch.",
  "Afterlife temporarily closed, sorry for the convenience PLAYER_0.",
  "Turns out the magic mushroom PLAYER_0 ate was a 1-Up!"
]

const REVIVE_OBJ: Omit<ActivityTypes, 'id' | 'description'> = {
  "environment": "REVIVE",
  "amountOfPlayers": 1,
  "activityWinner": [0],
  "activityLoser": undefined,
  "killCounts": undefined
}

export default {
  description: REVIVE,
  dataObject: REVIVE_OBJ
}