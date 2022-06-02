import '../styles/globals.css'
import ContainerRoot from '../containers/root'
import React from 'react'
import { SWRConfig } from 'swr'
import Nav from '../components/nav'
import fetchJson from '../lib/fetchJson';
import { createClient, WagmiConfig } from 'wagmi';

const wagmiClient = createClient()

function MyApp({ Component, pageProps }) {
  return (
    <SWRConfig
      value={{
        fetcher: fetchJson,
        onError: (err) => {
          console.error('---SWRConfig fetcher err', err)
        },
      }}
    >
      <WagmiConfig client={wagmiClient}>
        <ContainerRoot>
          <Nav />
          <Component {...pageProps} />
        </ContainerRoot>
      </WagmiConfig>
    </SWRConfig>
  )
}

export default MyApp