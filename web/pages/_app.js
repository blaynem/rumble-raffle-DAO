import '../styles/globals.css'
import ContainerRoot from '../containers/root'
import React from 'react'
import Nav from '../components/nav'

function MyApp({ Component, pageProps, darkMode }) {

  return (
    <ContainerRoot>
      <div className={darkMode ? 'dark' : ''}>
        <Nav />
        <Component {...pageProps} />
      </div>
    </ContainerRoot>
  )
}

export default MyApp