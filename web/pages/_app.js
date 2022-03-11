import '../styles/globals.css'
import ContainerRoot from '../containers/root'
import React, { useState, useEffect } from 'react'
import Router from 'next/router'
import UserContext from '../lib/UserContext'
import { supabase, fetchUserRoles } from '../lib/Store_ex'
import Nav from '../components/nav'

function MyApp({ Component, pageProps }) {
  const [userLoaded, setUserLoaded] = useState(false)
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [userRoles, setUserRoles] = useState([])

  useEffect(() => {
    const session = supabase.auth.session()
    console.log('--session', session);
    setSession(session)
    setUser(session?.user ?? null)
    setUserLoaded(session ? true : false)
    if (user) {
      signIn()
      Router.push('/channels/[id]', '/channels/1')
    }

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      const currentUser = session?.user
      setUser(currentUser ?? null)
      setUserLoaded(!!currentUser)
      if (currentUser) {
        signIn(currentUser.id, currentUser.email)
        Router.push('/channels/[id]', '/channels/1')
      }
    })

    return () => {
      authListener.unsubscribe()
    }
  }, [user])

  const signIn = async () => {
    await fetchUserRoles((userRoles) => setUserRoles(userRoles.map((userRole) => userRole.role)))
  }

  const signOut = async () => {
    const result = await supabase.auth.signOut()
    Router.push('/')
  }

  return (
    <ContainerRoot>
      <UserContext.Provider
        value={{
          userLoaded,
          user,
          userRoles,
          signIn,
          signOut,
        }}
      >
        <Nav />
        <Component {...pageProps} />
      </UserContext.Provider>
    </ContainerRoot>
  )
}

export default MyApp