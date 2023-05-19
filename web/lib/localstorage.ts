import { useState, useEffect } from 'react'

function getStorageValue(key: string, defaultValue: any) {
  if (typeof localStorage === 'undefined') {
    return defaultValue
  }
  // getting stored value
  const saved = localStorage.getItem(key)
  try {
    const initial = saved ? JSON.parse(saved) : null
    return initial || defaultValue
  } catch (e) {
    return defaultValue
  }
}

export const useLocalStorage = (key: string, defaultValue: any) => {
  const [localUser, setLocalUser] = useState(() => {
    return getStorageValue(key, defaultValue)
  })

  useEffect(() => {
    // storing input name
    if (typeof localStorage !== 'undefined' && typeof localUser !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(localUser))
    }
  }, [key, localUser])

  return [localUser, setLocalUser]
}
