import '../styles/globals.css'
import ContainerRoot from '../containers/root'
import React from 'react'
import { SWRConfig } from 'swr'
import Nav from '../components/nav'

const fetcher = url => fetch(url).then(r => r.json())

function MyApp({ Component, pageProps }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        onError: err => {
          console.error('---RumbleRaffleErr: SWRConfig', err)
        }
      }}
    >
      <ContainerRoot>
        <Nav />
        <Component {...pageProps} />
      </ContainerRoot>
    </SWRConfig>
  )
}

export default MyApp
