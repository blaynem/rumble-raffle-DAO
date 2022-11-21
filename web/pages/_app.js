import '../styles/globals.css'
import ContainerRoot from '../containers/root'
import React from 'react'
import { SWRConfig } from 'swr'
import Nav from '../components/nav'
import { createClient, WagmiConfig } from 'wagmi';

const wagmiClient = createClient()

const fetcher = url => fetch(url).then(r => r.json())

function MyApp({ Component, pageProps }) {
  return (
    <ContainerRoot>
      <Component {...pageProps} />
    </ContainerRoot>
  )
  // return (
  //   <SWRConfig
  //     value={{
  //       fetcher,
  //       onError: (err) => {
  //         console.error('---RumbleRaffleErr: SWRConfig', err)
  //       },
  //     }}
  //   >
  //     <WagmiConfig client={wagmiClient}>
  //       <ContainerRoot>
  //         {/* <Nav /> */}
  //         <Component {...pageProps} />
  //       </ContainerRoot>
  //     </WagmiConfig>
  //   </SWRConfig>
  // )
}

export default MyApp