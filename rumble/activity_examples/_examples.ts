import { ActivitiesObjType } from "../types";

const examples: ActivitiesObjType = {
  PVP: [
    {
      "id": "886f6a3f-b6d3-47ae-a2e5-93b58f9d41ed",
      "description": "PLAYER_0 killed PLAYER_1 with a knife.",
      "amountOfPlayers": 2,
      "activityWinner": [0],
      "activityLoser": [1],
      "killCounts": [1, 0]
    }, {
      "id": "b4938abf-4af9-41cd-9b32-848abd6575a0",
      "description": "PLAYER_0 and PLAYER_1 teamed up and ate PLAYER_2 alive.",
      "amountOfPlayers": 3,
      "activityWinner": [0, 1],
      "activityLoser": [2],
      "killCounts": [0.5, 0.5, 0]
    }
  ]
  ,
  PVE: [
    {
      "id": "92643c20-ae46-4a68-95f4-b3ebbb449777",
      "description": "PLAYER_0 crafted a spear out of a stick and a rock.",
      "amountOfPlayers": 1,
      "activityWinner": [0],
      "activityLoser": null,
      "killCounts": null
    },
    {
      "id": "1fb3a9e6-7fac-4bee-921f-e5d3f7b8b958",
      "description": "PLAYER_0 drank infected water and died.",
      "amountOfPlayers": 1,
      "activityWinner": null,
      "activityLoser": [0],
      "killCounts": null
    },
    {
      "id": "46756a5a-c804-4bba-90d0-52c34cfd79da",
      "description": "PLAYER_0 and PLAYER_1 tried to start a fire to stay warm using their own bodies as tinder.",
      "amountOfPlayers": 2,
      "activityWinner": null,
      "activityLoser": [0, 1],
      "killCounts": null
    }
  ],
  REVIVE: [
    {
      "id": "93d81cc0-07d8-4c2d-ae0a-c277e304a8b6",
      "description": "The population of heave just decreased, because PLAYER_0 is back!",
      "amountOfPlayers": 1,
      "activityWinner": [0],
      "activityLoser": null,
      "killCounts": null
    },
    {
      "id": "e8394d9b-9049-4688-9eef-70f734becdcd",
      "description": "PLAYER_0 has risen from the dead. Is that a zombie?",
      "amountOfPlayers": 1,
      "activityWinner": [0],
      "activityLoser": null,
      "killCounts": null
    }
  ]
}