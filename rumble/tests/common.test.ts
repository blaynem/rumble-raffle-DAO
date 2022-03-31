import { doActivity, doesEventOccur, getPlayersFromIds, getPlayersFromIndex, getRandomNumber } from "../common"
import { ActivityTypes, allPlayersObj } from "../types";


describe('common functions', () => {
  test('getPlayersFromIndex', () => {
    expect(getPlayersFromIndex(null, [])).toEqual(null);
    expect(getPlayersFromIndex([], [])).toEqual([]);
    expect(getPlayersFromIndex([0, 1], ['id1', 'id2'])).toEqual(['id1', 'id2']);
    expect(getPlayersFromIndex([2, 0], ['id1', 'id2', 'id3'])).toEqual(['id3', 'id1']);
  })

  test('getPlayersFromIds', () => {
    const playersObj: allPlayersObj = {
      '1': { id: '1', name: 'name1' },
      '2': { id: '2', name: 'name2' },
    }
    expect(getPlayersFromIds([], playersObj)).toEqual([]);
    expect(getPlayersFromIds(['2', '1'], playersObj)).toEqual([{ id: '2', name: 'name2' }, { id: '1', name: 'name1' }]);
  })

  test('doesEventOccur', () => {
    jest.spyOn(global.Math, 'random').mockReturnValueOnce(.05);
    // We are testing that the random number (random * 101) is less than the event occur percent (30)
    // We set mock return to .05 which turns to 5% (.05 * 101)
    expect(doesEventOccur(30)).toEqual(true); // 30 is greater than 5, so true

    jest.spyOn(global.Math, 'random').mockReturnValueOnce(1);
    // We set mock return to 1 which turns to 100 (1 * 101)
    expect(doesEventOccur(30)).toEqual(false); // 30 is less than 100, so false
  })

  test('getRandomNumber', () => {
    jest.spyOn(global.Math, 'random').mockReturnValueOnce(1);
    expect(getRandomNumber(100)).toEqual(100);
    jest.spyOn(global.Math, 'random').mockReturnValueOnce(.5);
    expect(getRandomNumber(100)).toEqual(50);
  })

  test('doActivity', () => {
    const testActivity: ActivityTypes = {
      id: 'test-id',
      environment: 'PVP',
      description: 'This is a fake description.',
      amountOfPlayers: 2,
      activityWinner: [1],
      activityLoser: [0],
      killCounts: [0, 1],
    };
    const playerIds: string[] = ['player1', 'player2'];
    const callbackContent = 'Test content callback';
    const callback = jest.fn(() => callbackContent);
    const {
      activity,
      activityId,
      participants,
      winners,
      losers,
      content,
      killCount
    } = doActivity(testActivity, playerIds, callback);
    expect(activity).toEqual(testActivity);
    expect(activityId).toEqual(testActivity.id);
    expect(participants).toEqual(playerIds);
    expect(winners).toEqual(['player2']);
    expect(losers).toEqual(['player1']);
    expect(content).toEqual(callbackContent);
    expect(killCount).toEqual({player1: 0, player2: 1});
  })
})