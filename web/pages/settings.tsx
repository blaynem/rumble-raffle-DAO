import Head from 'next/head'
import { withSessionSsr } from '../lib/with-session'

/**
 * TODO:
 * - Allow changing of user settings.
 */

const pageTitle = `Settings`
export default function PageIndex(props) {  
  return (
    <div>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content="Change user settings" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>Change settings</div>
    </div>
  )
}

export const getServerSideProps = withSessionSsr(({ req }) => {
  const user = req?.session?.user
  return {
    props: {
      ...(user && { user })
    }
  }
})