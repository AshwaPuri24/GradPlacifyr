/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  DEMO DATA CLEANER  —  Placement Portal
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  Deletes every row that was created by  scripts/seed-demo.js.
 *
 *  The seeder tags all demo accounts with the email domain
 *      @demo.placement.local
 *  This script uses that domain as the single source of truth: it finds all
 *  matching users, then cascades through the related tables in the correct
 *  order to respect foreign-key constraints.
 *
 *  Run from the backend folder:
 *      node scripts/clear-demo.js
 *
 *  Safe to run on a database with real data — only rows owned by or linked
 *  to demo users (by email domain) are touched.  Real users, real jobs,
 *  and real events are NEVER modified.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import 'dotenv/config'
import prisma from '../src/db/prisma.js'

const DEMO_DOMAIN = 'demo.placement.local'
const DEMO_EMAIL_SUFFIX = `@${DEMO_DOMAIN}`

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗')
  console.log('║   Placement Portal — DEMO DATA CLEANER                      ║')
  console.log(`║   Targeting email domain:  ${DEMO_EMAIL_SUFFIX}          ║`)
  console.log('╚══════════════════════════════════════════════════════════════╝')

  const demoUsers = await prisma.user.findMany({
    where: { email: { endsWith: DEMO_EMAIL_SUFFIX } },
    select: { id: true, email: true, role: true },
  })

  if (demoUsers.length === 0) {
    console.log('\nNo demo users found. Nothing to do.')
    return
  }

  const userIds = demoUsers.map((u) => u.id)
  console.log(`\nFound ${demoUsers.length} demo user(s). Cleaning up related rows…`)

  // 1. Jobs created by demo users — we'll need their ids to clean child rows.
  const demoJobs = await prisma.job.findMany({
    where: { created_by: { in: userIds } },
    select: { id: true },
  })
  const demoJobIds = demoJobs.map((j) => j.id)

  // 2. Applications — touch any that reference demo students OR demo jobs.
  //    Clear current_round_id first so round deletion can proceed safely.
  const appWhere = {
    OR: [
      { student_id: { in: userIds } },
      ...(demoJobIds.length ? [{ job_id: { in: demoJobIds } }] : []),
    ],
  }

  const appCount = await prisma.application.count({ where: appWhere })
  if (appCount) {
    await prisma.application.updateMany({ where: appWhere, data: { current_round_id: null } })
  }

  // 3. Round candidates — either student is demo OR round belongs to a demo job.
  const rcWhere = {
    OR: [
      { student_id: { in: userIds } },
      ...(demoJobIds.length ? [{ round: { job_id: { in: demoJobIds } } }] : []),
    ],
  }
  const rcDeleted = await prisma.roundCandidate.deleteMany({ where: rcWhere })

  // 4. Applications
  const appDeleted = await prisma.application.deleteMany({ where: appWhere })

  // 5. Rounds of demo jobs
  const roundDeleted = demoJobIds.length
    ? await prisma.round.deleteMany({ where: { job_id: { in: demoJobIds } } })
    : { count: 0 }

  // 6. Jobs
  const jobDeleted = demoJobIds.length
    ? await prisma.job.deleteMany({ where: { id: { in: demoJobIds } } })
    : { count: 0 }

  // 7. Events created by demo users
  const eventDeleted = await prisma.event.deleteMany({
    where: { created_by: { in: userIds } },
  })

  // 8. SSO tickets owned by demo users (FK cascade is declared in schema but
  //    Prisma still needs the delete when the FK action doesn't trigger
  //    via cascading from the user delete in Postgres).  We delete
  //    defensively here.
  const ssoDeleted = await prisma.ssoTicket.deleteMany({
    where: { user_id: { in: userIds } },
  })

  // 9. Student profiles
  const spDeleted = await prisma.studentProfile.deleteMany({
    where: { student_id: { in: userIds } },
  })

  // 10. Company profiles
  const cpDeleted = await prisma.companyProfile.deleteMany({
    where: { user_id: { in: userIds } },
  })

  // 11. OTPs associated with demo emails
  const otpDeleted = await prisma.otp.deleteMany({
    where: { email: { endsWith: DEMO_EMAIL_SUFFIX } },
  })

  // 12. Finally, users themselves
  const userDeleted = await prisma.user.deleteMany({
    where: { id: { in: userIds } },
  })

  console.log('\n✅  Demo data removed:')
  console.log(`    • Round candidates   : ${rcDeleted.count}`)
  console.log(`    • Applications       : ${appDeleted.count}`)
  console.log(`    • Rounds             : ${roundDeleted.count}`)
  console.log(`    • Jobs               : ${jobDeleted.count}`)
  console.log(`    • Events             : ${eventDeleted.count}`)
  console.log(`    • SSO tickets        : ${ssoDeleted.count}`)
  console.log(`    • Student profiles   : ${spDeleted.count}`)
  console.log(`    • Company profiles   : ${cpDeleted.count}`)
  console.log(`    • OTPs               : ${otpDeleted.count}`)
  console.log(`    • Users              : ${userDeleted.count}`)
  console.log('\n Database is back to its pre-demo state.')
}

main()
  .catch((err) => {
    console.error('\n❌  Demo clear failed:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
