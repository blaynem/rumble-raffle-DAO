import Head from 'next/head'

const pageTitle = `Rumble Raffle DAO`
export default function PageIndex(props) {
  return (
    <div>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
    </div>
  )
}
