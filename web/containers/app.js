import { createContainer } from 'unstated-next'

const useContainer = () => {
  const id = '123'
  return { id }
}
export const { useContainer: useApp, Provider: AppProvider } = createContainer(useContainer)