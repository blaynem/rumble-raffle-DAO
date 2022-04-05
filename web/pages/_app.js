import '../styles/globals.css'
import ContainerRoot from '../containers/root'
import React from 'react'
import Nav from '../components/nav'

function MyApp({ Component, pageProps }) {
  return (
    <ContainerRoot>
      <Nav />
      <Component {...pageProps} />
    </ContainerRoot>
  )
}

export default MyApp