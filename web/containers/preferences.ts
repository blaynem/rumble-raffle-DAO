import { createContainer } from 'unstated-next'
import { useLocalStorage } from '../lib/localstorage'

const useContainer = (initialState: any) => {
  const [preferences, setPreferences] = useLocalStorage('preferences', initialState)

  const setDarkmode = () => {
    setPreferences({ darkMode: !preferences?.darkMode })
  }

  return { preferences, setDarkmode }
}

const myContainer = createContainer(useContainer)
const usePreferences = myContainer.useContainer
const PreferencesProvider = myContainer.Provider

export { usePreferences, PreferencesProvider }
