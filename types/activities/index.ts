import { ActivityTypes } from "@rumble-raffle-dao/rumble";


const PVE_with_params = [
  "PLAYER_0 fell head first into XXX",
]

const PVP_with_params = [
  "PLAYER_0 stuck XXX into PLAYER_1's ear.",
  "PLAYER_0 climbed a tree and dropped XXX onto PLAYER_1.",
  "PLAYER_0's throat was slit by PLAYER_1 with XXX",
]

const weaponNouns = [
  'a banana',
  'a key for a 1997 Toyota Camry',
  'a webcam from 2004',
  'a shoe',
  'a very small elephant',
  'an egg beater',
  'a slap',
  'a dollar bill',
  'a raygun',
  'a jail key',
  'a crusty pair of socks',
  'a slingshot',
  'dirt',
  'bb gun',
  'barbed wire',
  'a fart',
  'smelly feet',
  'a cucumber',
  'a tomato',
  'a toothpick',
  'some rusty nails',
  'a dump truck full of dog poop bags',
  'a swarm of bees',
  'a sinkhole',
  'a well trained goat',
  'a knife',
  'a chickens talons',
  'a tennis racket',
  'a monkey',
  'a floppy disk',
  'a used macbook pro',
  'some pencil shavings',
  'a bag of milky ways',
]

const fillOutPhraseObj = (message: string, items: string[], obj: Omit<ActivityTypes, 'id' | 'description'>): Omit<ActivityTypes, 'id'>[] => {
  const matchPlayerNumber = 'XXX' // matches XXX
  return items.map(item => ({
    ...obj,
    description: message.replace(matchPlayerNumber, item),
  }))
}

var fs = require('fs');

const writeToJSON = () => {
  // const phraseData = fillOutPhraseObj(
  //   "PLAYER_0 climbed a tree and dropped XXX on PLAYER_1. Their one true weakness.",
  //   weaponNouns,
  //   {
  //     "environment": "PVP",
  //     "amountOfPlayers": 2,
  //     "activityWinner": [0],
  //     "activityLoser": [1],
  //     "killCounts": [1, 0]
  //   }
  // )
  let things = [];
  const phraseData: Omit<ActivityTypes, 'id'>[] = things.map(phrase => ({
    description: phrase,
    "environment": "PVE",
    "amountOfPlayers": 1,
    "activityWinner": null,
    "activityLoser": [0],
    "killCounts": null
  }))

  fs.readFile('activities.json', 'utf8', function readFileCallback(err, data) {
    if (err) {
      console.log('--err', err);
    } else {
      const dataArr = [...JSON.parse(data), ...phraseData]; //now it an object
      const json = JSON.stringify(dataArr); //convert it back to json
      fs.writeFile('activities.json', json, 'utf8', () => {
        console.log('--done writing');
      }); // write it back 
    }
  });
}

writeToJSON();