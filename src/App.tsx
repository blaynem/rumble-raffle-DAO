import React, { useState } from 'react';
import './App.css';
import { faker } from '@faker-js/faker';
import RumbleApp, { ActivityLogType, PlayerType, PrizeValuesType } from './Rumble';

const Rumble = new RumbleApp();

const fakePlayerToAdd = (): PlayerType => ({
  id: faker.datatype.uuid(),
  name: faker.name.firstName()
});

const DisplayEntrant = ({ id, name, onClick }: PlayerType & {onClick?: any }) => (
  <div style={{ border: '1px solid gray', padding: 8, position: 'relative' }} key={id}>
    <div>Id: {id}</div>
    <div>Name: {name}</div>
    <button onClick={() => onClick(id)} style={{ position: 'absolute', top: 0, right: 0 }}>Remove</button>
  </div>
)

const DisplayPrizes = ({ firstPlace, secondPlace, thirdPlace, kills, altSplit, totalPrize, totalEntrants }: PrizeValuesType & { totalEntrants: number }) => (
  <div style={{ border: '1px solid gray', padding: 8 }} >
    <div>Total Entrants: {totalEntrants} Bird Warriors</div>
    <div>Kills: {kills} sFNC</div>
    <div>1st: {firstPlace} sFNC</div>
    <div>2nd: {secondPlace} sFNC</div>
    <div>3rd: {thirdPlace} sFNC</div>
    <div>Stakers: {altSplit} sFNC</div>
    <div>Total: {totalPrize} sFNC</div>
  </div>
);

const DisplayActivityLog = (logs: ActivityLogType) => {
  return (
    <div>
      <div>Round {logs.roundCounter}</div>
      {logs.roundActivityLog.map((activity, index) => (<div key={`${activity.activityId}-${index}`}>{activity.content}</div>))}
      <div>Players Left: {logs.playersRemainingIds.length}</div>
    </div>
  )
}

function App() {
  const [entrants, setEntrants] = useState([] as PlayerType[]);
  const [prizes, setPrizes] = useState(Rumble.getPrizes() as PrizeValuesType);
  const [activityLog, setActivityLog] = useState([] as ActivityLogType[]);

  const debugRumble = () => {
    console.log(Rumble.debug());
  }

  const getPrizes = () => {
    setPrizes(Rumble.getPrizes());
  }

  const addPlayer = () => {
    const allPlayers = Rumble.addPlayer(fakePlayerToAdd())
    setEntrants([...allPlayers])
    getPrizes();
  }

  const removePlayer = (id: string) => {
    const allPlayers = Rumble.removePlayer(id)
    setEntrants([...allPlayers])
    getPrizes();
  }

  const startGame = () => {
    Rumble.startGame();
    updateActivityLog();
  }

  const clearGame = () => {
    Rumble.clearGame();
    updateActivityLog();
  }

  const nextRound = () => {
    Rumble.nextRound();
    updateActivityLog();
  }

  const updateActivityLog = () => {
    const activityLogTest = Rumble.getActivityLog()
    setActivityLog([...activityLogTest])
  }
  
  return (
    <div className="App">
      <div>
        <button onClick={debugRumble}>DEBUG</button>
        <button onClick={addPlayer}>Add Player</button>
        <button onClick={startGame}>Start Game</button>
        <button onClick={nextRound}>Next Round</button>
        <button onClick={clearGame}>Clear Game</button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        <div style={{ width: 500 }}>
          <h2>Prize Splits</h2>
          <DisplayPrizes {...prizes} totalEntrants={entrants.length} />
        </div>
        <div style={{ width: 500 }}>
          <h2>Entrants</h2>
          {entrants.map(entrant => <DisplayEntrant key={entrant.id} {...entrant} onClick={removePlayer} />)}
        </div>
      </div>
      <div>
        <div>Activity Log</div>
        {activityLog.map(entry => <DisplayActivityLog key={entry.id} {...entry} />)}
      </div>
    </div>
  );
}

export default App;
