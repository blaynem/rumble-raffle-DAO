import { ActivityTypes } from "@rumble-raffle-dao/rumble"

const PVE_DESCRIPTION_LIVE = [
  "PLAYER_0 ate a magical brownie and enjoyed watching the sunset in their tree house.",
  "PLAYER_0 was caught red handed hoarding omelettes.",
  "PLAYER_0 found a shiny treasure from a crow's nest!",
  "Support has arrived! PLAYER_0 has been gifted some water.",
]

const PVE_OBJECT_LIVE: Omit<ActivityTypes, 'id' | 'description'> = {
  "environment": "PVE",
  "amountOfPlayers": 1,
  "activityWinner": [0],
  "activityLoser": undefined,
  "killCounts": undefined
}

export default {
  description: PVE_DESCRIPTION_LIVE,
  dataObject: PVE_OBJECT_LIVE
}