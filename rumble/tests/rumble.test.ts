import RumbleApp, { defaultSetup, initialGamePayouts } from '../rumble';
import { RoundActivityLogType, RumbleInterface, SetupType, WinnerLogType } from '../types';
import { TEST_ACTIVITIES } from './constants';
import * as common from '../common';

const player1 = { id: '1', name: 'player-1' }
const player2 = { id: '2', name: 'player-2' }
const player3 = { id: '3', name: 'player-3' }
const defaultAllPlayersObj = { 1: player1, 2: player2, 3: player3 }
const defaultAllPlayerIds = ['1', '2', '3']
const defaultInitialPlayers = [player1, player2, player3]

describe('Rumble App', () => {
  describe('on initialization', () => {
    test('throws error if prize split !== 100', () => {
      const setup: SetupType = {
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
      const setup: SetupType = {
        ...defaultSetup,
        initialPlayers: defaultInitialPlayers,
      };
      const rumbleRaffle = new RumbleApp(setup);
      expect(rumbleRaffle.allPlayerIds).toEqual(defaultAllPlayerIds);
      expect(rumbleRaffle.allPlayers).toEqual(defaultAllPlayersObj)
    });
  })

  describe('addPlayer function', () => {
    const setup: SetupType = {
      ...defaultSetup,
      initialPlayers: defaultInitialPlayers,
    };
    let rumbleRaffle: RumbleInterface;

    beforeEach(() => {
      rumbleRaffle = new RumbleApp(setup);
    })

    test('adds player and calls setPlayer', () => {
      const expectedPrizesObj = {
        altSplit: 4.5,
        creatorSplit: 0.01,
        firstPlace: 25,
        secondPlace: 7.5,
        thirdPlace: 2.5,
        kills: 2,
        totalPrize: 50,
      }
      const newPlayer = { id: 'new', name: 'new-player' }
      const newPlayer2 = { id: 'new2', name: 'new-player2' }

      // Add 1 player
      rumbleRaffle.addPlayer(newPlayer);
      // Add second player and do tests
      const addAnotherPlayer = rumbleRaffle.addPlayer(newPlayer2);
      expect(addAnotherPlayer).toEqual([...setup.initialPlayers, newPlayer, newPlayer2])

      expect(rumbleRaffle.allPlayerIds).toEqual([...defaultAllPlayerIds, 'new', 'new2']);
      expect(rumbleRaffle.allPlayerIds.length).toBe(5);
      expect(rumbleRaffle.totalPlayers).toBe(5);
      expect(rumbleRaffle.allPlayers).toEqual({ ...defaultAllPlayersObj, 'new': newPlayer, 'new2': newPlayer2 });
      // prize changes
      expect(rumbleRaffle.totalPrize).toEqual(rumbleRaffle.entryPrice * 5);
      expect(rumbleRaffle.prizes).toEqual(expectedPrizesObj);
    })

    test('cannot add a player with the same id or when game has already started', () => {
      const expectedPrizesObj = {
        altSplit: 2.6999999999999997,
        creatorSplit: 0.01,
        firstPlace: 15,
        secondPlace: 4.5,
        thirdPlace: 1.5,
        kills: 2,
        totalPrize: 30,
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
      expect(rumbleRaffle.allPlayerIds.length).toBe(3);
      expect(rumbleRaffle.totalPlayers).toBe(3);
      expect(rumbleRaffle.allPlayers).toEqual(defaultAllPlayersObj);
      // no prize changes
      expect(rumbleRaffle.totalPrize).toEqual(rumbleRaffle.entryPrice * 3);
      expect(rumbleRaffle.prizes).toEqual(expectedPrizesObj);
    })
  })

  describe('clearPlayers', () => {
    test('clears all palyers and their ids from the game', () => {
      const setup: SetupType = {
        ...defaultSetup,
        initialPlayers: defaultInitialPlayers,
      };
      const rumbleRaffle = new RumbleApp(setup);
      expect(rumbleRaffle.allPlayerIds.length).toBe(3);
      expect(rumbleRaffle.allPlayers).toEqual(defaultAllPlayersObj);

      rumbleRaffle.clearPlayers();
      expect(rumbleRaffle.allPlayerIds.length).toBe(0);
      expect(rumbleRaffle.allPlayers).toEqual({});
    })
  })

  describe('removePlayer function', () => {
    const setup: SetupType = {
      ...defaultSetup,
      initialPlayers: defaultInitialPlayers,
    };
    let rumbleRaffle: RumbleInterface;

    beforeEach(() => {
      rumbleRaffle = new RumbleApp(setup);
    })

    test('removes the player and calls the setPlayers function', () => {
      const expectedPrizesObj = {
        altSplit: 1.7999999999999998,
        creatorSplit: 0.01,
        firstPlace: 10,
        secondPlace: 3,
        thirdPlace: 1,
        kills: 2,
        totalPrize: 20,
      }
      expect(rumbleRaffle.allPlayerIds.length).toBe(3);
      expect(rumbleRaffle.allPlayers).toEqual(defaultAllPlayersObj);
      // Remove the player
      const returnedVal = rumbleRaffle.removePlayer(player1.id);
      expect(returnedVal).toEqual([player2, player3])
      expect(rumbleRaffle.allPlayerIds.length).toBe(2);
      expect(rumbleRaffle.allPlayers).toEqual({ 2: player2, 3: player3 });
      // check the prize changes
      expect(rumbleRaffle.totalPrize).toEqual(rumbleRaffle.entryPrice * 2);
      expect(rumbleRaffle.prizes).toEqual(expectedPrizesObj);
    })
    test('cannot remove a player if the game has already started', () => {
      const expectedPrizesObj = {
        altSplit: 2.6999999999999997,
        creatorSplit: 0.01,
        firstPlace: 15,
        secondPlace: 4.5,
        thirdPlace: 1.5,
        kills: 2,
        totalPrize: 30,
      }
      expect(rumbleRaffle.allPlayerIds.length).toBe(3);
      expect(rumbleRaffle.allPlayers).toEqual(defaultAllPlayersObj);
      // Set game started to true
      rumbleRaffle.gameStarted = true;
      // Attempt to remove the player
      const returnedVal = rumbleRaffle.removePlayer(player1.id);
      expect(returnedVal).toEqual(null)
      expect(rumbleRaffle.allPlayerIds.length).toBe(3);
      expect(rumbleRaffle.allPlayers).toEqual(defaultAllPlayersObj);
      // check that prizes did NOT change
      expect(rumbleRaffle.totalPrize).toEqual(rumbleRaffle.entryPrice * 3);
      expect(rumbleRaffle.prizes).toEqual(expectedPrizesObj);
    })
  })

  describe('internal functios', () => {
    const setup: SetupType = {
      ...defaultSetup,
      activities: TEST_ACTIVITIES,
      initialPlayers: defaultInitialPlayers,
    };
    let rumbleRaffle: RumbleInterface;

    beforeEach(() => {
      rumbleRaffle = new RumbleApp(setup);
    })

    test('getAllPlayers returns the correct data', () => {
      const allPlayers = rumbleRaffle.getAllPlayers();
      expect(allPlayers).toEqual([player1, player2, player3])
    })

    test('getPrizes returns the prizes', () => {
      expect(rumbleRaffle.getPrizes()).toBe(rumbleRaffle.prizes);
    })

    test('getActivityLog returns the activity logs', () => {
      expect(rumbleRaffle.getActivityLog()).toBe(rumbleRaffle.gameActivityLogs);
    })

    test('startGame updates the correct state', () => {
      const restartGameSpy = jest.spyOn(rumbleRaffle, 'restartGame');
      expect(rumbleRaffle.playersRemainingIds).toEqual([]);
      expect(rumbleRaffle.gameStarted).toBe(false);

      (rumbleRaffle as any).startGame();

      expect(restartGameSpy).toBeCalledTimes(1);
      expect(rumbleRaffle.playersRemainingIds).toEqual(rumbleRaffle.allPlayerIds);
      expect(rumbleRaffle.gameStarted).toBe(true);
    })

    test('startGame does nothing if game is already started or playerId length < 2', () => {
      const restartGameSpy = jest.spyOn(rumbleRaffle, 'restartGame');
      // Assure it does not start when lacking players
      rumbleRaffle.allPlayerIds = [];
      (rumbleRaffle as any).startGame();
      expect(restartGameSpy).toBeCalledTimes(0);

      // Assure it does not called restart when game is already started
      rumbleRaffle.allPlayerIds = defaultAllPlayerIds;
      rumbleRaffle.gameStarted = true;
      (rumbleRaffle as any).startGame();
      expect(restartGameSpy).toBeCalledTimes(0);
    })

    test('getActivityLoopTimes returns the correct minimum amounts', () => {
      const randomNumberSpy = jest.spyOn(common, 'getRandomNumber').mockImplementation(() => 0);
      expect((rumbleRaffle as any).getActivityLoopTimes(12)).toEqual(2);
      expect((rumbleRaffle as any).getActivityLoopTimes(46)).toEqual(5);
      expect((rumbleRaffle as any).getActivityLoopTimes(101)).toEqual(10);
      expect((rumbleRaffle as any).getActivityLoopTimes(201)).toEqual(15);
      expect((rumbleRaffle as any).getActivityLoopTimes(501)).toEqual(20);
      randomNumberSpy.mockClear();
    })

    test('nextRound fires the create round if gameStarted = true', () => {
      const createRoundSpy = jest
        .spyOn((rumbleRaffle as any), 'createRound')
        .mockImplementation(() => { });

      (rumbleRaffle as any).nextRound();
      expect(createRoundSpy).not.toBeCalled();

      (rumbleRaffle as any).startGame();
      (rumbleRaffle as any).nextRound();
      expect(createRoundSpy).toBeCalled();
      createRoundSpy.mockClear();
    })

    test('restartGame resets all the correct variables', () => {
      rumbleRaffle.gameActivityLogs = [{}, {}] as any;
      rumbleRaffle.gameKills = { 1: 1 };
      rumbleRaffle.gamePayouts = null as any;
      rumbleRaffle.gameRunnerUps = ['123', '1423'] as any;
      rumbleRaffle.gameStarted = true;
      rumbleRaffle.gameWinner = { id: '1234', name: 'todd' };
      rumbleRaffle.playersRemainingIds = ['41231', '512132']
      rumbleRaffle.playersSlainIds = ['4123123', '512124'];
      rumbleRaffle.roundCounter = 42;

      rumbleRaffle.restartGame();

      expect(rumbleRaffle.gameActivityLogs).toEqual([]);
      expect(rumbleRaffle.gameKills).toEqual({});
      expect(rumbleRaffle.gamePayouts).toEqual(initialGamePayouts);
      expect(rumbleRaffle.gameRunnerUps).toEqual([]);
      expect(rumbleRaffle.gameStarted).toEqual(false);
      expect(rumbleRaffle.gameWinner).toEqual(null);
      expect(rumbleRaffle.playersRemainingIds).toEqual([]);
      expect(rumbleRaffle.playersSlainIds).toEqual([]);
      expect(rumbleRaffle.roundCounter).toEqual(0);
    })

    test('getPlayerById returns the proper player', () => {
      expect(rumbleRaffle.getPlayerById('2')).toBe(player2)
    })

    test('getGameWinner returns proper default runnerUps and winner', () => {
      expect(rumbleRaffle.getGameWinner()).toEqual({ runnerUps: [], winner: null })
    })
  })

  describe('pickAndCreateActivity', () => {
    const setup: SetupType = {
      ...defaultSetup,
      activities: TEST_ACTIVITIES,
      initialPlayers: defaultInitialPlayers,
    };
    let rumbleRaffle: RumbleInterface;
    beforeEach(() => {
      rumbleRaffle = new RumbleApp(setup);
    })

    it('picks a PVE round when only 1 playerId ', () => {
      const pickActivitySpy = jest.spyOn(common, 'pickActivity');
      // Only include the single player for this test
      (rumbleRaffle as any).pickAndCreateActivity([player1.id]);
      const activityOptions = pickActivitySpy.mock.calls[0][0];
      const filterPveActivities = activityOptions.filter(activity => activity.environment !== 'PVE')
      // It should not have any activities besides PVE
      expect(filterPveActivities.length).toEqual(0);
      pickActivitySpy.mockClear();
    })

    it('picks a PVE round when more than 1 player and doesEventOccur is true', () => {
      const doesEventOccurSpy = jest.spyOn(common, 'doesEventOccur').mockImplementation(() => true);
      const pickActivitySpy = jest.spyOn(common, 'pickActivity');
      // Only include the single player for this test
      (rumbleRaffle as any).pickAndCreateActivity(defaultAllPlayerIds);
      const activityOptions = pickActivitySpy.mock.calls[0][0];
      const filterPveActivities = activityOptions.filter(activity => activity.environment !== 'PVE')
      // It should not have any activities besides PVE
      expect(filterPveActivities.length).toEqual(0);
      // Clear mocks
      pickActivitySpy.mockClear();
      doesEventOccurSpy.mockClear();
    })

    it('picks a PVP round when more than 1 player and doesEventOccur is false', () => {
      const doesEventOccurSpy = jest.spyOn(common, 'doesEventOccur').mockImplementation(() => false);
      const pickActivitySpy = jest.spyOn(common, 'pickActivity');
      // Only include the single player for this test
      (rumbleRaffle as any).pickAndCreateActivity(defaultAllPlayerIds);
      const activityOptions = pickActivitySpy.mock.calls[0][0];
      const filterPveActivities = activityOptions.filter(activity => activity.environment !== 'PVP')
      // It should not have any activities besides PVP
      expect(filterPveActivities.length).toEqual(0);
      // Clear mocks
      pickActivitySpy.mockClear();
      doesEventOccurSpy.mockClear();
    })
  })

  describe('createRound', () => {
    const setup: SetupType = {
      ...defaultSetup,
      activities: TEST_ACTIVITIES,
      initialPlayers: defaultInitialPlayers,
    };
    let rumbleRaffle: RumbleInterface;
    beforeEach(() => {
      rumbleRaffle = new RumbleApp(setup);
    })

    it('sets the game winner and does nothing else if one player remaining', () => {
      const setGameWinSpy = jest.spyOn((rumbleRaffle as any), 'setGameWinner');
      const doesEventOccurSpy = jest.spyOn(common, 'doesEventOccur');
      rumbleRaffle.playersRemainingIds = [player1.id];
      (rumbleRaffle as any).createRound();

      expect(setGameWinSpy).toHaveBeenCalledWith(player1.id);
      // Theres not a lot to check, so we're looking at if a playerRevives this rounds chance
      expect(doesEventOccurSpy).not.toHaveBeenCalled();

      setGameWinSpy.mockClear();
      doesEventOccurSpy.mockClear();
    });

    it('completes a revive player activity', () => {
      const doesEventOccurSpy = jest.spyOn(common, 'doesEventOccur');
      const getActivityLoopTimesSpy = jest.spyOn((rumbleRaffle as any), 'getActivityLoopTimes');
      // Set the game state
      rumbleRaffle.playersRemainingIds = [player1.id, player2.id];
      rumbleRaffle.playersSlainIds = [player3.id];

      expect(rumbleRaffle.getActivityLog()).toEqual([]);

      // The first `doesEventOccur` happens for the `playerRevives` param in createRound.
      doesEventOccurSpy.mockReturnValueOnce(true);
      // We don't want any activity loops, just want to revive someone.
      getActivityLoopTimesSpy.mockReturnValueOnce(0);
      (rumbleRaffle as any).createRound();

      // Test the activity log itself
      const activityLog = rumbleRaffle.getActivityLog()[0] as RoundActivityLogType;
      expect(activityLog.playersRemainingIds).toEqual(["1", "2", "3"]);
      expect(activityLog.playersSlainIds).toEqual([]);
      expect(activityLog.roundCounter).toEqual(0);

      // test the first activity (the revive) in the log
      const firstActivity = activityLog.activityLog[0].activity;
      expect(firstActivity.environment).toEqual('REVIVE');

      // Test the game state variables
      expect(rumbleRaffle.playersRemainingIds).toEqual(["1", "2", "3"]);
      expect(rumbleRaffle.playersSlainIds).toEqual([]);
      expect(rumbleRaffle.roundCounter).toEqual(1);

      doesEventOccurSpy.mockClear();
      getActivityLoopTimesSpy.mockClear();
    });

    it('completes a player event w/o revive', () => {
      const mockActivity = {
        losers: [player3.id],
        participants: defaultAllPlayerIds
      }
      const doesEventOccurSpy = jest.spyOn(common, 'doesEventOccur');
      const getActivityLoopTimesSpy = jest.spyOn((rumbleRaffle as any), 'getActivityLoopTimes');
      const pickAndCreateActivitySpy = jest.spyOn((rumbleRaffle as any), 'pickAndCreateActivity');
      // Set the initial game state
      rumbleRaffle.playersRemainingIds = defaultAllPlayerIds;

      expect(rumbleRaffle.getActivityLog()).toEqual([]);

      // We don't want to revive anyone.
      doesEventOccurSpy.mockReturnValueOnce(false);
      // We want a single activity loop
      getActivityLoopTimesSpy.mockReturnValueOnce(1);
      // We want to remove specific players from the pool this time
      pickAndCreateActivitySpy.mockReturnValueOnce(mockActivity);
      (rumbleRaffle as any).createRound();

      // Test the activity log itself
      const activityLog = rumbleRaffle.getActivityLog()[0] as RoundActivityLogType;
      expect(activityLog.playersRemainingIds).toEqual(["1", "2"]);
      expect(activityLog.playersSlainIds).toEqual(['3']);
      expect(activityLog.roundCounter).toEqual(0);

      // Test the game state variables
      expect(rumbleRaffle.playersRemainingIds).toEqual(["1", "2"]);
      expect(rumbleRaffle.playersSlainIds).toEqual(['3']);
      expect(rumbleRaffle.roundCounter).toEqual(1);

      doesEventOccurSpy.mockClear();
      getActivityLoopTimesSpy.mockClear();
      pickAndCreateActivitySpy.mockClear();
    });
  });

  describe('startAutoPlayGame', () => {
    const setup: SetupType = {
      ...defaultSetup,
      activities: TEST_ACTIVITIES,
      initialPlayers: defaultInitialPlayers,
    };
    let rumbleRaffle: RumbleInterface;

    beforeEach(() => {
      rumbleRaffle = new RumbleApp(setup);
    })

    it('does not fire nextRound if gameStarted = false', () => {
      // We mock this implementation so it doesn't change gameStarted to false
      const startGameSpy = jest.spyOn((rumbleRaffle as any), 'startGame').mockImplementation();
      const nextRoundSpy = jest.spyOn((rumbleRaffle as any), 'nextRound');

      rumbleRaffle.startAutoPlayGame();

      expect(nextRoundSpy).not.toBeCalled();
      startGameSpy.mockClear();
      nextRoundSpy.mockClear();
    });

    it('fires startGame, nextRound and gameFinished', () => {
      const startGameSpy = jest.spyOn((rumbleRaffle as any), 'startGame');
      const nextRoundSpy = jest.spyOn((rumbleRaffle as any), 'nextRound');
      const gameFinishedSpy = jest.spyOn((rumbleRaffle as any), 'gameFinished');

      rumbleRaffle.startAutoPlayGame();

      expect(startGameSpy).toBeCalled();
      expect(nextRoundSpy).toBeCalled();
      expect(gameFinishedSpy).toBeCalled();

      startGameSpy.mockClear();
      nextRoundSpy.mockClear();
      gameFinishedSpy.mockClear();
    });
  })

  describe('setGameWinner works correctly', () => {
    const setup: SetupType = {
      ...defaultSetup,
      activities: TEST_ACTIVITIES,
      initialPlayers: defaultInitialPlayers,
    };
    const rumbleRaffle = new RumbleApp(setup);
    const calculateTotalKillCountsSpy = jest.spyOn((rumbleRaffle as any), 'calculateTotalKillCounts').mockImplementation();
    const calculatePayoutsSpy = jest.spyOn((rumbleRaffle as any), 'calculatePayouts').mockImplementation();
    // We set players slain as 1, 2 (they died in that order)
    rumbleRaffle.playersSlainIds = [player1.id, player2.id];

    (rumbleRaffle as any).setGameWinner('3');

    // Test the activity log itself
    const winnerLog = rumbleRaffle.getActivityLog()[0] as WinnerLogType;
    expect(winnerLog.playersSlainIds).toEqual(['1', '2']);
    expect(winnerLog.winner).toEqual(player3);
    expect(winnerLog.winnerId).toEqual('3');
    expect(winnerLog.runnerUps).toEqual([player2, player1]);
    expect(winnerLog.runnerUpIds).toEqual(['2', '1']);

    // Calls the calculate total kill count and calculate payouts
    expect(calculateTotalKillCountsSpy).toBeCalled();
    expect(calculatePayoutsSpy).toBeCalled();

    calculateTotalKillCountsSpy.mockClear();
    calculatePayoutsSpy.mockClear();
  });

  describe('calculateTotalKillCounts works correctly', () => {
    const setup: SetupType = {
      ...defaultSetup,
      activities: TEST_ACTIVITIES,
      initialPlayers: defaultInitialPlayers,
    };
    // totals: player1 - 2; player2 - 7; player3 - 2
    const testActivityLog1: any = [
      { killCount: { '1': 1, '2': 2 } },
      { killCount: { '2': 1 } },
    ];
    const testActivityLog2: any = [
      { killCount: { '3': 1, '2': 3, '1': 1 } },
      { killCount: { '2': 1 } }
    ];
    const round1 = { activityLog: testActivityLog1 };
    const round2 = { activityLog: testActivityLog2 }
    const testGameActivityLogs: any = [round1, round2];

    const rumbleRaffle = new RumbleApp(setup);
    rumbleRaffle.gameActivityLogs = testGameActivityLogs;

    (rumbleRaffle as any).calculateTotalKillCounts();

    expect(rumbleRaffle.gameKills).toEqual({ '1': 2, '2': 7, '3': 1 });
  });

  describe('calculatePayouts works correctly', () => {
    const setup: SetupType = {
      ...defaultSetup,
      activities: TEST_ACTIVITIES,
      initialPlayers: defaultInitialPlayers,
    };
    const expectedPrizesObj = {
      altSplit: 1,
      creatorSplit: 2,
      firstPlace: 3,
      secondPlace: 4,
      thirdPlace: 5,
      kills: 6,
      totalPrize: 100,
    }
    const rumbleRaffle = new RumbleApp(setup);
    rumbleRaffle.prizes = expectedPrizesObj;
    rumbleRaffle.gameKills = { '1': 1, '2': 2, '3': 3 };

    (rumbleRaffle as any).calculatePayouts();

    expect(rumbleRaffle.gamePayouts).toEqual({
      altSplit: 1,
      creatorSplit: 2,
      kills: { '1': 6, '2': 12, '3': 18 },
      remainder: 49,
      secondPlace: 4,
      thirdPlace: 5,
      total: 100,
      winner: 3
    });
  })
})