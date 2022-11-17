import { PrismaClient, Prisma, Activities } from '@prisma/client'

// Note needing the ?pgbouncer=true here, otherwise the put doesn't work after the first findmany
const prodDB = 'postgres://postgres:3DSXKqAQdhsN4yErv8N8FKsEXWCWT95e@db.hrrfgvqwszvehzmvwdej.supabase.co:6543/postgres?pgbouncer=true'
const testDB = "postgresql://postgres:xpCH3kqVbCAxDms2mJQEN6Y2YQYsACyn@db.fllmtcgxklldbbksslkp.supabase.co:5432/postgres?pgbouncer=true"

const doThing = async () => {
  const prodPrisma = new PrismaClient({ datasources: { db: { url: prodDB } } })
  const testPrisma = new PrismaClient({ datasources: { db: { url: testDB } } })

  const thing = await testPrisma.activities.findMany({where: {environment: 'REVIVE'}})
  const put = await prodPrisma.activities.createMany({ data: thing})
  console.log(put);
}

doThing();