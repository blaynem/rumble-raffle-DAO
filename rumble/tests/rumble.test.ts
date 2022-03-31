import RumbleApp, { defaultSetup } from '../rumble';
import { RumbleInterface } from '../types';

describe('Rumble App', () => {
  const player1 = { id: '1', name: 'player-1' }
  const player2 = { id: '2', name: 'player-2' }
  const defaultAllPlayersObj = { 1: player1, 2: player2 }
  const defaultAllPlayerIds = ['1', '2']

  describe('on initialization', () => {
    test('throws error if prize split !== 100', () => {
      const setup = {
        ...defaultSetup,
        prizeSplit: {
          kills: 99,
          thirdPlace: 99,
          secondPlace: 99,
          firstPlace: 99,
          altSplit: 99,
          creatorSplit: 99,
        }
      };
      expect(() => new RumbleApp(setup)).toThrowError('Prize split totals must equal exactly 100.');
    });

    test('adds correct initial players', () => {
      const setup = {
        ...defaultSetup,
        initialPlayers: [player1, player2],
      };
      const rumbleRaffle = new RumbleApp(setup);
      expect(rumbleRaffle.allPlayerIds).toEqual(defaultAllPlayerIds);
      expect(rumbleRaffle.allPlayers).toEqual(defaultAllPlayersObj)
    });
  })

  describe('addPlayer function', () => {
    const setup = {
      ...defaultSetup,
      initialPlayers: [player1, player2],
    };
    let rumbleRaffle: RumbleInterface;

    beforeEach(() => {
      rumbleRaffle = new RumbleApp(setup);
    })

    test('adds player and calls setPlayer', () => {
      const expectedPrizesObj = {
        altSplit: 3.5999999999999996,
        creatorSplit: 0.01,
        firstPlace: 20,
        secondPlace: 6,
        thirdPlace: 2,
        kills: 2,
        totalPrize: 40,
      }
      const newPlayer = { id: 'new', name: 'new-player' }
      const newPlayer2 = { id: 'new2', name: 'new-player2' }

      // Add 1 player
      rumbleRaffle.addPlayer(newPlayer);
      // Add second player and do tests
      const addAnotherPlayer = rumbleRaffle.addPlayer(newPlayer2);
      expect(addAnotherPlayer).toEqual([...setup.initialPlayers, newPlayer, newPlayer2])

      expect(rumbleRaffle.allPlayerIds).toEqual([...defaultAllPlayerIds, 'new', 'new2']);
      expect(rumbleRaffle.allPlayerIds.length).toBe(4);
      expect(rumbleRaffle.totalPlayers).toBe(4);
      expect(rumbleRaffle.allPlayers).toEqual({ ...defaultAllPlayersObj, 'new': newPlayer, 'new2': newPlayer2 });
      // prize changes
      expect(rumbleRaffle.totalPrize).toEqual(rumbleRaffle.entryPrice * 4);
      expect(rumbleRaffle.prizes).toEqual(expectedPrizesObj);
    })

    test('cannot add a player with the same id or when game has already started', () => {
      const expectedPrizesObj = {
        altSplit: 1.7999999999999998,
        creatorSplit: 0.01,
        firstPlace: 10,
        secondPlace: 3,
        thirdPlace: 1,
        kills: 2,
        totalPrize: 20,
      }
      // Attempt to add player
      const addPlayer = rumbleRaffle.addPlayer(player1);
      expect(addPlayer).toEqual(null);
      // Start game
      rumbleRaffle.gameStarted = true;
      // Should behave the same way as when game wasn't started.
      const addPlayerWhenGameStart = rumbleRaffle.addPlayer(player1);
      expect(addPlayerWhenGameStart).toEqual(null);

      expect(rumbleRaffle.allPlayerIds).toEqual(defaultAllPlayerIds);
      expect(rumbleRaffle.allPlayerIds.length).toBe(2);
      expect(rumbleRaffle.totalPlayers).toBe(2);
      expect(rumbleRaffle.allPlayers).toEqual(defaultAllPlayersObj);
      // no prize changes
      expect(rumbleRaffle.totalPrize).toEqual(rumbleRaffle.entryPrice * 2);
      expect(rumbleRaffle.prizes).toEqual(expectedPrizesObj);
    })
  })

  describe('clearPlayers', () => {
    test('clears all palyers and their ids from the game', () => {
      const setup = {
        ...defaultSetup,
        initialPlayers: [player1, player2],
      };
      const rumbleRaffle = new RumbleApp(setup);
      expect(rumbleRaffle.allPlayerIds.length).toBe(2);
      expect(rumbleRaffle.allPlayers).toEqual(defaultAllPlayersObj);

      rumbleRaffle.clearPlayers();
      expect(rumbleRaffle.allPlayerIds.length).toBe(0);
      expect(rumbleRaffle.allPlayers).toEqual({});
    })
  })

  describe('removePlayer function', () => {
    const setup = {
      ...defaultSetup,
      initialPlayers: [player1, player2],
    };
    let rumbleRaffle: RumbleInterface;

    beforeEach(() => {
      rumbleRaffle = new RumbleApp(setup);
    })

    test('removes the player and calls the setPlayers function', () => {
      const expectedPrizesObj = {
        altSplit: 0.8999999999999999,
        creatorSplit: 0.01,
        firstPlace: 5,
        secondPlace: 1.5,
        thirdPlace: 0.5,
        kills: 2,
        totalPrize: 10,
      }
      expect(rumbleRaffle.allPlayerIds.length).toBe(2);
      expect(rumbleRaffle.allPlayers).toEqual(defaultAllPlayersObj);
      // Remove the player
      const returnedVal = rumbleRaffle.removePlayer(player1.id);
      expect(returnedVal).toEqual([player2])
      expect(rumbleRaffle.allPlayerIds.length).toBe(1);
      expect(rumbleRaffle.allPlayers).toEqual({2: player2});
      // check the prize changes
      expect(rumbleRaffle.totalPrize).toEqual(rumbleRaffle.entryPrice);
      expect(rumbleRaffle.prizes).toEqual(expectedPrizesObj);
    })
    test('cannot remove a player if the game has already started', () => {
      const expectedPrizesObj = {
        altSplit: 1.7999999999999998,
        creatorSplit: 0.01,
        firstPlace: 10,
        secondPlace: 3,
        thirdPlace: 1,
        kills: 2,
        totalPrize: 20,
      }
      expect(rumbleRaffle.allPlayerIds.length).toBe(2);
      expect(rumbleRaffle.allPlayers).toEqual(defaultAllPlayersObj);
      // Set game started to true
      rumbleRaffle.gameStarted = true;
      // Attempt to remove the player
      const returnedVal = rumbleRaffle.removePlayer(player1.id);
      expect(returnedVal).toEqual(null)
      expect(rumbleRaffle.allPlayerIds.length).toBe(2);
      expect(rumbleRaffle.allPlayers).toEqual(defaultAllPlayersObj);
      // check that prizes did NOT change
      expect(rumbleRaffle.totalPrize).toEqual(rumbleRaffle.entryPrice * 2);
      expect(rumbleRaffle.prizes).toEqual(expectedPrizesObj);
    })
  })

  describe('internal functios', () => {
    const setup = {
      ...defaultSetup,
      initialPlayers: [player1, player2],
    };
    let rumbleRaffle: RumbleInterface;

    beforeEach(() => {
      rumbleRaffle = new RumbleApp(setup);
    })

    test('getAllPlayers returns the correct data', () => {
      const allPlayers = rumbleRaffle.getAllPlayers();
      expect(allPlayers).toEqual([player1, player2])
    })

    test('getPrizes returns the prizes', () => {
      expect(rumbleRaffle.getPrizes()).toBe(rumbleRaffle.prizes);
    })

    test('getActivityLog returns the activity logs', () => {
      expect(rumbleRaffle.getActivityLog()).toBe(rumbleRaffle.gameActivityLogs);
    })
  })
})