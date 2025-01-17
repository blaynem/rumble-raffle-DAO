import * as React from 'react'
import Head from 'next/head'
import { GetServerSidePropsContext } from 'next'
import { usePreferences } from '../../containers/preferences'
import { useEffect, useState } from 'react'
import { SERVER_BASE_PATH, SERVER_AUTH_DISCORD } from '@rumble-raffle-dao/types/constants'
import { BASE_API_URL } from '../../lib/constants'
import {
  AuthDiscordVerifyGetResponse,
  AuthDiscordVerifyPostResponse,
  AuthStoreValue
} from '@rumble-raffle-dao/types'
import { useUser } from '../../containers/userHook'
import { useSignMessage } from 'wagmi'

type ServerProps = {
  auth: AuthStoreValue | null
}

export async function getServerSideProps(
  context: GetServerSidePropsContext
): Promise<{ props: ServerProps }> {
  const { verification_id } = context.query
  const { data } = await fetch(
    `${BASE_API_URL}${SERVER_BASE_PATH}${SERVER_AUTH_DISCORD}/${verification_id}`
  ).then(res => res.json() as Promise<AuthDiscordVerifyGetResponse>)

  return {
    props: {
      auth: data || null
    }
  }
}

const pageTitle = `Verify Discord`
export default function PageIndex({ auth }: ServerProps) {
  const { user } = useUser()
  const { preferences } = usePreferences()
  const [verifySuccess, setVerifySuccess] = useState(false)
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    setDarkMode(preferences?.darkMode)
  }, [preferences?.darkMode])

  const { signMessageAsync } = useSignMessage({
    message: `Discord Tag: ${auth?.discord_tag}\nDiscord Id: ${auth?.discord_id}\nVerification Id: ${auth?.verification_id}`
  })

  if (!user || !user.id || !auth) {
    return (
      <div style={{ height: 'calc(100vh - 58px)' }} className={`${darkMode ? 'dark' : 'light'}`}>
        <h2 className="text-center text-lg leading-6 font-medium p-8 dark:text-rumbleNone text-rumbleOutline dark:bg-black bg-rumbleBgLight w-full h-full">
          You must login before verifying.
        </h2>
      </div>
    )
  }

  const onVerifyMeClick = async () => {
    try {
      setVerifyLoading(true)

      const signature = await signMessageAsync()
      const { error }: AuthDiscordVerifyPostResponse = await fetch('/api/auth/discord', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          signature
        },
        body: JSON.stringify({ verification_id: auth.verification_id })
      }).then(res => res.json())

      setVerifyLoading(false)

      if (error) {
        window.alert(error)
        return
      }

      setVerifySuccess(true)
    } catch (err) {
      console.error(err)
      setVerifyLoading(false)
    }
  }

  if (!auth.discord_id) {
    return (
      <div className={`${darkMode ? 'dark' : 'light'}`}>
        <Head>
          <title>{pageTitle}</title>
          <meta name="description" content="Verify Discord" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div
          className="p-8 dark:bg-black bg-rumbleBgLight w-full overflow-auto scrollbar-thin dark:scrollbar-thumb-rumbleSecondary scrollbar-thumb-rumblePrimary scrollbar-track-rumbleBgDark"
          style={{ height: 'calc(100vh - 58px)' }}
        >
          <h1 className="uppercase font-medium mt-6 mb-12 text-2xl text-center dark:text-rumbleSecondary text-rumblePrimary">
            Discord Verification
          </h1>
          <section className="md:px-40 sm:px-8">
            <p className="text-xl text-center mb-2 dark:text-rumbleNone text-rumbleOutline">
              Looks like you stepped in the wrong neighborhood, homie.
            </p>
            <h2 className="text-center uppercase mb-2 text-xl dark:text-rumbleSecondary text-rumblePrimary">
              Uh oh..
            </h2>
          </section>
        </div>
      </div>
    )
  }

  if (verifySuccess) {
    return (
      <div className={`${darkMode ? 'dark' : 'light'}`}>
        <div
          className="p-8 dark:bg-black bg-rumbleBgLight w-full overflow-auto scrollbar-thin dark:scrollbar-thumb-rumbleSecondary scrollbar-thumb-rumblePrimary scrollbar-track-rumbleBgDark"
          style={{ height: 'calc(100vh - 58px)' }}
        >
          <h1 className="uppercase font-medium mt-6 mb-12 text-2xl text-center dark:text-rumbleSecondary text-rumblePrimary">
            Discord Verification
          </h1>
          <section className="md:px-40 sm:px-8">
            <h2 className="uppercase mb-2 text-xl dark:text-rumbleSecondary text-rumblePrimary">
              Success!
            </h2>
            <p className="mb-8 dark:text-rumbleNone text-rumbleOutline">
              Discord verification successful! You may close this page and return to discord.
            </p>
          </section>
        </div>
      </div>
    )
  }

  const buttonClass =
    'inline-block mr-4 px-6 py-4 dark:bg-rumbleNone bg-rumbleOutline dark:text-black text-rumbleNone text-xs uppercase transition duration-150 ease-in-out dark:hover:bg-rumbleSecondary hover:bg-rumblePrimary dark:focus:bg-rumbleSecondary focus:bg-rumblePrimary'
  const buttonDisabled =
    'inline-block mr-4 px-6 py-4 dark:bg-rumbleNone bg-rumbleOutline dark:text-black text-rumbleNone text-xs uppercase transition duration-150 ease-in-out pointer-events-none opacity-60'

  return (
    <div className={`${darkMode ? 'dark' : 'light'}`}>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content="Verify Discord" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div
        className="p-8 dark:bg-black bg-rumbleBgLight w-full overflow-auto scrollbar-thin dark:scrollbar-thumb-rumbleSecondary scrollbar-thumb-rumblePrimary scrollbar-track-rumbleBgDark"
        style={{ height: 'calc(100vh - 58px)' }}
      >
        <h1 className="uppercase font-medium mt-6 mb-12 text-2xl text-center dark:text-rumbleSecondary text-rumblePrimary">
          Discord Verification
        </h1>
        <section className="md:px-40 sm:px-8">
          <h2 className="uppercase mb-2 text-xl dark:text-rumbleSecondary text-rumblePrimary">
            Let&apos;s get you verified!
          </h2>
          <p className="mb-8 dark:text-rumbleNone text-rumbleOutline">
            Are you {auth.discord_tag}?
          </p>
          <div>
            <button
              onClick={onVerifyMeClick}
              className={verifyLoading ? buttonDisabled : buttonClass}
            >
              {verifyLoading ? 'Loading..' : 'Verify Me!'}
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
