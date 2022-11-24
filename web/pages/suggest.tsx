import { Environment, Prisma } from '.prisma/client';
import { ToastTypes } from '@rumble-raffle-dao/types';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import ToastMessage from '../components/toast';
import { usePreferences } from '../containers/preferences';
import { useDiscordUser } from '../containers/useDiscordUser';
import { XIcon } from '@heroicons/react/outline';

const fieldContainerClass = 'mb-4';
const headerClass = "mb-2 uppercase leading-7 text-lg font-medium dark:text-rumbleSecondary text-rumblePrimary";
const fieldClass = 'p-4 h-14 dark:focus:ring-rumbleNone focus:ring-rumbleOutline dark:focus:border-rumbleNone focus:border-rumbleOutline dark:bg-rumbleBgDark bg-rumbleNone dark:text-rumbleNone text-rumbleOutline flex-1 block w-full border-none';
const labelClass = "mb-1 uppercase block text-base font-medium leading-6 dark:text-rumbleNone text-rumbleOutline";

const MAX_PLAYER_COUNT = 4;

const InputField = ({ id, label, placeholder, inputType = "text", onChange, value, showHintText = false }) => (
  <div className={fieldContainerClass}>
    <label className={labelClass} htmlFor={id}>{label}</label>
    <input
      onChange={onChange}
      value={value}
      type={inputType}
      className={fieldClass}
      id={id}
      placeholder={placeholder}
    />
    {showHintText && <p className='font-normal  dark:text-rumbleNone text-rumbleOutline text-sm mt-2 pl-2'>Ex: {placeholder}</p>}
  </div>
)

type DropDownField = {
  id: string,
  options: string[] | { value: string; text: string }[],
  label: string;
  value: Environment;
  onChange: any;
}

const DropDownField = ({ id, label, options, onChange, value }: DropDownField) => (
  <div className={fieldContainerClass}>
    <label className={labelClass} htmlFor={id}>{label}</label>
    <select
      onChange={onChange}
      id={id}
      className={fieldClass}
      aria-label="Default select example"
      value={value}
    >
      {options.map(option => (
        (typeof option === "string") ?
          <option key={option} value={option}>{option}</option> :
          <option key={option.value} value={option.value}>{option.text}</option>
      ))}
    </select>
  </div>
)

type PlayerComponentType = {
  index: number;
  isChecked: boolean;
  killCount: number;
  onClick: (index: number, isChecked: boolean) => void;
  onDeleteClick: (index: number) => void;
  onKillCountChange: (index: number, value: number) => void;
}

const PlayerComponent = ({ index, onClick, onDeleteClick, isChecked, killCount, onKillCountChange }: PlayerComponentType) => {
  const playerName = `PLAYER_${index}` as string;
  const killCountId = `killCount_${index}` as string;
  const onChecked = () => {
    onClick(index, isChecked)
  }
  return (
    <div className="flex p-2 dark:text-rumbleNone text-rumbleOutline items-center">
      <p className='mr-8 w-20'>{playerName}</p>
      <div className='flex items-center w-60'>
        <label className='mr-2 select-none cursor-pointer' htmlFor={playerName}>Winner?</label>
        <input className='mr-4 cursor-pointer' type="checkbox" onChange={onChecked} checked={isChecked} id={playerName} name={playerName} />
        <label className='mr-2 select-none cursor-pointer' htmlFor={killCountId}>Kill Count:</label>
        <input
          id={killCountId}
          type='number'
          onChange={(e) => onKillCountChange(index, parseInt(e.target.value))}
          value={killCount}
          style={{ maxWidth: '32px' }}
          className={'pl-1 dark:focus:ring-rumbleNone focus:ring-rumbleOutline dark:focus:border-rumbleNone focus:border-rumbleOutline dark:bg-rumbleBgDark bg-rumbleNone dark:text-rumbleNone text-rumbleOutline flex-1 block border-none'}
          placeholder="0"
          min={0}
          max={MAX_PLAYER_COUNT}
        />
        <button className='ml-auto' onClick={() => onDeleteClick(index)}><XIcon className="block h-6 w-6" aria-hidden="true" /></button>
      </div>
    </div>
  )
}

const validate = (data: Prisma.SuggestedActivitiesCreateInput): string[] => {
  const errors = [];

  // Check description for correct amount of PLAYERS
  const testDescription = (): string => {
    if (!data.description || data.description.trim() === "") return 'Description can not be blank.';

    const matches = data?.description.match(/(PLAYER_[0-9]\b)/g) || [];
    const uniqueMatches = new Set(matches)

    const missingMatches = []
    // Loop through the players that should be in the description.
    // If they're not included, we need to warn the user.
    for (let i = 0; i < data.amountOfPlayers; i++) {
      const player = `PLAYER_${i}`
      if (!uniqueMatches.has(player)) {
        missingMatches.push(player)
      }
    }
    console.log({ matches, allMatches: uniqueMatches });
    if (missingMatches.length > 0) {
      return `Missing ${missingMatches.join(', ')} in description.`
    }

    if (uniqueMatches.size !== data.amountOfPlayers) {
      return "Players in description do not match 'Added Players'."
    }

    return null;
  }

  const descriptionErr = testDescription();
  if (descriptionErr) {
    errors.push(descriptionErr);
  }

  if (data.amountOfPlayers < 1) {
    errors.push('Must have at least 1 player.');
  }

  if ((data.killCounts as number[]).reduce((acc, curr) => acc += curr, 0) > MAX_PLAYER_COUNT) {
    errors.push(`Kill count can not be greater than ${MAX_PLAYER_COUNT}.`);
  }

  if ((data.killCounts as number[]).reduce((acc, curr) => acc += curr, 0) > data.amountOfPlayers) {
    errors.push(`Kill count can not be greater than player amount.`);
  }

  return errors;
}

const customError = (msg: string) => <div className='text-base h-10 text-red-600 py-2'>{msg}</div>

type Player = { isWinner: boolean; killCount: number }

const Suggest = () => {
  const router = useRouter();
  const { userId, guildId } = useDiscordUser(router.query as any);
  const [playerArr, setPlayerArr] = useState<Player[]>([]);
  const { preferences } = usePreferences();
  const [description, setDescription] = useState<string>('');
  const [environment, setEnvironment] = useState<Environment>(Environment.PVP);
  // State
  const [toastOpen, setToastOpen] = useState(false);
  const [toast, setToast] = useState<ToastTypes>(null);
  const [errorMessage, setErrorMessage] = useState<string>(null);

  if (!userId || !guildId) {
    return (
      <div className={`${preferences?.darkMode ? 'dark' : 'light'}`}>
        <div className='dark:bg-black bg-rumbleBgLight w-full mx-auto py-8 px-6 lg:px-[15%] md:px-[10%] sm:px-10 overflow-auto scrollbar-thin dark:scrollbar-thumb-rumbleSecondary scrollbar-thumb-rumblePrimary scrollbar-track-rumbleBgDark"' style={{ height: 'calc(100vh - 58px)' }}>
          <p className={labelClass}>Please visit discord to get suggestion link.</p>
        </div>
      </div>
    )
  }

  const clearFieldsAndErrors = () => {
    setPlayerArr([])
    setDescription('')
    setEnvironment('PVP')
    setErrorMessage(null)
  }

  const handleSetToast = (options: ToastTypes | null) => {
    if (!options) {
      setToastOpen(false)
      return;
    }
    const { message, type } = options;
    setToast({ message, type })
    setToastOpen(true)
  }

  const addPlayer = () => {
    if (playerArr.length >= MAX_PLAYER_COUNT) {
      return;
    }
    const newPlayer: Player = {
      isWinner: false,
      killCount: 0
    }
    setPlayerArr([...playerArr, newPlayer])
  }

  const onWinnerClick = (index: number, isChecked: boolean) => {
    const newArr = [...playerArr];
    const updatePlayer: Player = {
      ...playerArr[index],
      isWinner: !isChecked,
    };
    newArr[index] = updatePlayer;
    setPlayerArr(newArr)
  }

  const onDeleteClick = (index: number) => {
    const newArr = [...playerArr];
    newArr.splice(index, 1)
    setPlayerArr(newArr)
  }

  const onKillCountChange = (index: number, value: number) => {
    const newArr = [...playerArr];
    const updatePlayer: Player = {
      ...playerArr[index],
      killCount: value,
    };
    newArr[index] = updatePlayer;
    setPlayerArr(newArr)
  }

  const handleSubmit = async () => {
    // Clear initial errors
    setErrorMessage(null);
    const activityWinner = playerArr.reduce((acc: number[], curr, index) => curr.isWinner ? [...acc, index] : acc, []);
    const activityLoser = playerArr.reduce((acc: number[], curr, index) => curr.isWinner ? acc : [...acc, index], []);
    const killCounts = playerArr.map((curr) => {
      return curr.killCount
    });

    const putObj: Prisma.SuggestedActivitiesCreateInput = {
      activityWinner,
      activityLoser,
      amountOfPlayers: playerArr.length,
      description,
      environment,
      killCounts
    }
    const errors = validate(putObj);
    if (errors.length > 0) {
      setErrorMessage(errors.join(' '))
      return;
    }

    // TODO: Make the fetch!
    const { error } = await fetch(`/api/suggest`, {
      method: 'POST',
      body: JSON.stringify({ data: putObj, guildId, userId })
    }).then(res => res.json())

    if (error) {
      handleSetToast({ type: 'ERROR', message: error });
      return
    }
    handleSetToast({ type: 'SUCCESS', message: 'Thank you for your suggestion!' });
    clearFieldsAndErrors();
  }

  return (
    <div className={`${preferences?.darkMode ? 'dark' : 'light'}`}>
      <div className='dark:bg-black bg-rumbleBgLight w-full mx-auto py-8 px-6 lg:px-[15%] md:px-[10%] sm:px-10 overflow-auto scrollbar-thin dark:scrollbar-thumb-rumbleSecondary scrollbar-thumb-rumblePrimary scrollbar-track-rumbleBgDark"' style={{ height: 'calc(100vh - 58px)' }}>
        <h4 className={headerClass}>Suggest An Activity</h4>
        <InputField
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          id="description"
          label="Description"
          showHintText
          placeholder="PLAYER_0 threw an apple at PLAYER_1, it was super effective!" />
        <DropDownField
          value={environment}
          onChange={(e) => setEnvironment(e.target.value)}
          id="environment"
          label='Environment'
          options={Object.values(Environment)}
        />
        <button onClick={addPlayer} className="uppercase mb-4 h-14 py-4 px-6 border-2 dark:border-rumbleBgLight border-rumbleBgDark dark:bg-rumbleBgLight bg-rumbleBgDark dark:hover:bg-rumbleSecondary dark:hover:border-rumbleSecondary hover:bg-rumblePrimary hover:border-rumblePrimary dark:text-rumbleOutline text-rumbleNone font-medium">Add Player</button>
        <div>
          {playerArr.map((val, i) =>
            <PlayerComponent key={i} index={i} onClick={onWinnerClick} isChecked={val.isWinner} onDeleteClick={onDeleteClick} onKillCountChange={onKillCountChange} killCount={val.killCount} />
          )}
          {playerArr.length >= 4 && <div>Max of 4 players.</div>}
        </div>
        <button
          onClick={handleSubmit}
          type="submit"
          className="uppercase h-14 mt-4 mr-8 py-4 px-6 border-2 dark:border-rumbleBgLight border-rumbleBgDark dark:bg-rumbleBgLight bg-rumbleBgDark dark:hover:bg-rumbleSecondary dark:hover:border-rumbleSecondary hover:bg-rumblePrimary hover:border-rumblePrimary dark:text-rumbleOutline text-rumbleNone font-medium"
        >
          Save
        </button>
        {errorMessage && customError(errorMessage)}
        <div className='absolute top-2 right-2 z-20'>
          {toastOpen && <ToastMessage message={toast.message} type={toast.type} onClick={() => handleSetToast(null)} />}
        </div>
      </div>
    </div>
  )
}

export default Suggest;