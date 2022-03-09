import '../styles/globals.css'
import ContainerRoot from '../containers/root'

function MyApp({ Component, pageProps }) {
  return (
    <ContainerRoot>
      <Component {...pageProps} />
    </ContainerRoot>
  )
}

export default MyApp