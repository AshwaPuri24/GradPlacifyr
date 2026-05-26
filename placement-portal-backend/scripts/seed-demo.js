/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  DEMO DATA SEEDER  —  Placement Portal
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  Inserts a realistic medium-scale Indian college placement dataset for
 *  demo / screenshot / walkthrough purposes.  Everything created by this
 *  script is tagged with the email domain  @demo.placement.local  so it can
 *  be wiped later in one shot with  scripts/clear-demo.js.
 *
 *  Run from the backend folder:
 *      node scripts/seed-demo.js
 *
 *  Idempotent: re-running the script updates existing demo rows instead of
 *  duplicating them (upsert on email).  The only mutating writes without
 *  a natural key are Applications / Rounds / RoundCandidates / Events —
 *  those are deleted-and-recreated for the demo users at the top of the run
 *  so the dataset stays deterministic.
 *
 *  Default password for every demo account:  Demo@1234
 *  (meets the project's STRONG_PASSWORD_REGEX — upper, lower, digit, special)
 *
 *  NOTE:  No application code is modified by this script.  It only writes
 *  to the database through the existing Prisma client.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import 'dotenv/config'
import bcrypt from 'bcryptjs'
import prisma from '../src/db/prisma.js'

// ───────────────────────────── constants ─────────────────────────────────────

const DEMO_DOMAIN = 'demo.placement.local'
const DEMO_PASSWORD = 'Demo@1234'
const BCRYPT_ROUNDS = 12

// ─── tiny deterministic helpers so repeat runs produce the same data ─────────

function pick(arr, i) {
  return arr[i % arr.length]
}

function pickMany(arr, count, seed) {
  const out = []
  for (let i = 0; i < count; i++) out.push(arr[(seed + i * 7) % arr.length])
  return out
}

// ─── catalogues ──────────────────────────────────────────────────────────────

const FIRST_NAMES = [
  'Aarav', 'Ananya', 'Arjun', 'Diya', 'Ishaan', 'Kavya', 'Reyansh', 'Saanvi',
  'Vihaan', 'Myra', 'Aditya', 'Anika', 'Krishna', 'Priya', 'Rohan', 'Shreya',
  'Varun', 'Tanvi', 'Karthik', 'Neha', 'Siddharth', 'Pooja', 'Aryan', 'Riya',
  'Dhruv', 'Isha', 'Om', 'Meera', 'Harsh', 'Nisha', 'Kabir', 'Aditi',
  'Vivaan', 'Sneha', 'Yash', 'Divya', 'Arnav', 'Kriti', 'Manav', 'Sakshi',
]
const LAST_NAMES = [
  'Sharma', 'Verma', 'Iyer', 'Gupta', 'Patel', 'Reddy', 'Nair', 'Khan',
  'Singh', 'Mehta', 'Joshi', 'Kulkarni', 'Rao', 'Chopra', 'Malhotra', 'Das',
]

const COMPANIES = [
  { name: 'Infosys',        industry: 'IT Services',        location: 'Bengaluru',  website: 'https://infosys.com' },
  { name: 'TCS',             industry: 'IT Services',        location: 'Mumbai',     website: 'https://tcs.com' },
  { name: 'Wipro',           industry: 'IT Services',        location: 'Bengaluru',  website: 'https://wipro.com' },
  { name: 'Flipkart',        industry: 'E-Commerce',         location: 'Bengaluru',  website: 'https://flipkart.com' },
  { name: 'Zomato',          industry: 'Food Tech',          location: 'Gurugram',   website: 'https://zomato.com' },
  { name: 'Paytm',           industry: 'Fintech',            location: 'Noida',      website: 'https://paytm.com' },
  { name: 'Swiggy',          industry: 'Food Tech',          location: 'Bengaluru',  website: 'https://swiggy.com' },
  { name: 'Freshworks',      industry: 'SaaS',               location: 'Chennai',    website: 'https://freshworks.com' },
  { name: 'Razorpay',        industry: 'Fintech',            location: 'Bengaluru',  website: 'https://razorpay.com' },
  { name: 'Zoho',            industry: 'SaaS',               location: 'Chennai',    website: 'https://zoho.com' },
]

const JOB_TITLES = [
  'Software Engineer Trainee',
  'Associate Software Engineer',
  'Backend Developer Intern',
  'Frontend Developer Intern',
  'Full Stack Developer',
  'Data Analyst',
  'Data Engineer',
  'ML Engineer Intern',
  'DevOps Engineer',
  'QA Engineer',
  'SDE-1',
  'Product Analyst',
  'Android Developer',
  'Cloud Support Associate',
  'Cybersecurity Analyst',
]

const LANG_POOL = ['Java', 'Python', 'JavaScript', 'TypeScript', 'C++', 'Go', 'Kotlin', 'SQL']
const FRAMEWORK_POOL = ['React', 'Node.js', 'Express', 'Spring Boot', 'Django', 'Flask', 'Next.js', 'TensorFlow']
const TOOL_POOL = ['Git', 'Docker', 'AWS', 'Kubernetes', 'Jira', 'Postman', 'Figma', 'MongoDB', 'PostgreSQL']
const CERT_POOL = ['AWS Cloud Practitioner', 'Google Data Analytics', 'Oracle Java SE 11', 'Azure Fundamentals', 'Coursera ML Specialization']

const APP_STATUSES = [
  'applied', 'applied', 'applied',
  'eligible', 'eligible',
  'shortlisted', 'shortlisted',
  'test_scheduled',
  'interview_scheduled',
  'selected',
  'rejected',
]

const ROUND_TEMPLATES = [
  ['Online Aptitude Test', 'Technical Interview', 'HR Interview'],
  ['Coding Round', 'System Design', 'Managerial Round', 'HR Interview'],
  ['Group Discussion', 'Technical Interview', 'HR Round'],
  ['Online Assessment', 'Pair Programming', 'Final Interview'],
]

// ───────────────────────────── core helpers ─────────────────────────────────

async function hashPwd() {
  return bcrypt.hash(DEMO_PASSWORD, BCRYPT_ROUNDS)
}

async function upsertUser({ email, role, name, phone = null, enrollment_number = null }) {
  const password_hash = await hashPwd()
  return prisma.user.upsert({
    where: { email },
    update: { role, name, phone, enrollment_number, status: 'active' },
    create: {
      email,
      password_hash,
      role,
      name,
      phone,
      enrollment_number,
      status: 'active',
    },
  })
}

// ───────────────────────────── seeders ───────────────────────────────────────

async function seedStaff() {
  const admin = await upsertUser({
    email: `admin@${DEMO_DOMAIN}`,
    role: 'admin',
    name: 'Demo Admin',
    phone: '9000000001',
  })
  const tpo = await upsertUser({
    email: `tpo@${DEMO_DOMAIN}`,
    role: 'tpo',
    name: 'Prof. Ramesh Iyer (TPO)',
    phone: '9000000002',
  })
  const hod = await upsertUser({
    email: `hod@${DEMO_DOMAIN}`,
    role: 'hod',
    name: 'Dr. Anjali Menon (HOD, CSE)',
    phone: '9000000003',
  })
  return { admin, tpo, hod }
}

async function seedRecruiters() {
  const recruiters = []
  for (let i = 0; i < COMPANIES.length; i++) {
    const c = COMPANIES[i]
    const slug = c.name.toLowerCase().replace(/[^a-z]/g, '')
    const user = await upsertUser({
      email: `recruiter.${slug}@${DEMO_DOMAIN}`,
      role: 'recruiter',
      name: `${pick(FIRST_NAMES, i + 3)} ${pick(LAST_NAMES, i + 1)} — ${c.name}`,
      phone: `98${String(10000000 + i * 13).padStart(8, '0')}`,
    })

    await prisma.companyProfile.upsert({
      where: { user_id: user.id },
      update: {
        company_name: c.name,
        about: `${c.name} is a leading ${c.industry.toLowerCase()} company hiring bright graduates for our ${c.location} office.`,
        website: c.website,
        industry: c.industry,
        location: c.location,
      },
      create: {
        user_id: user.id,
        company_name: c.name,
        about: `${c.name} is a leading ${c.industry.toLowerCase()} company hiring bright graduates for our ${c.location} office.`,
        website: c.website,
        industry: c.industry,
        location: c.location,
      },
    })

    recruiters.push({ user, company: c })
  }
  return recruiters
}

async function seedStudents(count = 40) {
  const students = []
  for (let i = 0; i < count; i++) {
    const first = pick(FIRST_NAMES, i)
    const last = pick(LAST_NAMES, i + 5)
    const enroll = `CSE21${String(100 + i).padStart(3, '0')}`
    const email = `${first.toLowerCase()}.${last.toLowerCase()}${i}@${DEMO_DOMAIN}`

    const user = await upsertUser({
      email,
      role: 'student',
      name: `${first} ${last}`,
      phone: `90${String(10000000 + i * 7).padStart(8, '0')}`,
      enrollment_number: enroll,
    })

    const tenth = 70 + ((i * 3) % 28)          // 70–97
    const twelfth = 65 + ((i * 5) % 32)        // 65–96
    const backlogs = i % 11 === 0 ? 1 : 0
    const gradYear = 2026 + (i % 2)
    const langs = pickMany(LANG_POOL, 3 + (i % 3), i)
    const frameworks = pickMany(FRAMEWORK_POOL, 2 + (i % 3), i + 2)
    const tools = pickMany(TOOL_POOL, 3, i + 4)
    const certs = pickMany(CERT_POOL, 1 + (i % 2), i)

    const projects = [
      {
        title: 'Placement Portal Clone',
        stack: `${frameworks[0]}, ${langs[0]}, PostgreSQL`,
        description: 'Full-stack portal for campus hiring with OTP auth and role-based dashboards.',
      },
      {
        title: `${pick(['Smart Attendance', 'Library Tracker', 'Expense Splitter', 'Health Chatbot'], i)} App`,
        stack: `${frameworks[1] || 'React'}, ${langs[1] || 'JavaScript'}`,
        description: 'College minor project that won appreciation at the department expo.',
      },
    ]

    await prisma.studentProfile.upsert({
      where: { student_id: user.id },
      update: {
        tenth_percentage: tenth,
        twelfth_percentage: twelfth,
        backlogs,
        graduation_year: gradYear,
        programming_languages: langs.join(', '),
        frameworks: frameworks.join(', '),
        tools: tools.join(', '),
        certifications: certs.join(', '),
        projects_json: JSON.stringify(projects),
        internship_experience: i % 3 === 0
          ? `Summer intern at ${pick(COMPANIES, i).name} — worked on internal dashboards (2 months).`
          : '',
        achievements: i % 4 === 0 ? 'Winner, Smart India Hackathon 2024 (department round).' : '',
        github_url: `https://github.com/${first.toLowerCase()}${last.toLowerCase()}${i}`,
        linkedin_url: `https://linkedin.com/in/${first.toLowerCase()}-${last.toLowerCase()}-${i}`,
        portfolio_url: i % 5 === 0 ? `https://${first.toLowerCase()}${i}.dev` : null,
      },
      create: {
        student_id: user.id,
        tenth_percentage: tenth,
        twelfth_percentage: twelfth,
        backlogs,
        graduation_year: gradYear,
        programming_languages: langs.join(', '),
        frameworks: frameworks.join(', '),
        tools: tools.join(', '),
        certifications: certs.join(', '),
        projects_json: JSON.stringify(projects),
        internship_experience: i % 3 === 0
          ? `Summer intern at ${pick(COMPANIES, i).name} — worked on internal dashboards (2 months).`
          : '',
        achievements: i % 4 === 0 ? 'Winner, Smart India Hackathon 2024 (department round).' : '',
        github_url: `https://github.com/${first.toLowerCase()}${last.toLowerCase()}${i}`,
        linkedin_url: `https://linkedin.com/in/${first.toLowerCase()}-${last.toLowerCase()}-${i}`,
        portfolio_url: i % 5 === 0 ? `https://${first.toLowerCase()}${i}.dev` : null,
      },
    })

    students.push(user)
  }
  return students
}

async function seedJobs(recruiters, tpo) {
  // Delete any existing demo jobs (and cascading rounds/applications) so the
  // mix stays deterministic across repeated runs.
  const recruiterIds = recruiters.map((r) => r.user.id).concat([tpo.id])

  // Find existing demo jobs
  const existing = await prisma.job.findMany({
    where: { created_by: { in: recruiterIds } },
    select: { id: true },
  })
  const existingIds = existing.map((j) => j.id)
  if (existingIds.length) {
    await prisma.roundCandidate.deleteMany({
      where: { round: { job_id: { in: existingIds } } },
    })
    await prisma.application.deleteMany({ where: { job_id: { in: existingIds } } })
    await prisma.round.deleteMany({ where: { job_id: { in: existingIds } } })
    await prisma.job.deleteMany({ where: { id: { in: existingIds } } })
  }

  const jobs = []
  for (let i = 0; i < 15; i++) {
    const rec = recruiters[i % recruiters.length]
    const title = pick(JOB_TITLES, i)
    const ctcValue = 4 + ((i * 3) % 16) // 4–19 LPA
    const ctc = `${ctcValue} LPA`
    const location = rec.company.location
    const createdBy = i % 5 === 0 ? tpo.id : rec.user.id // TPO posts some, recruiters post most
    const status = i % 7 === 0 ? 'closed' : 'open'

    const description =
      `${rec.company.name} is hiring for the role of ${title} at its ${location} office. ` +
      `You will work with a talented team on ${pick(['scalable web services', 'data pipelines', 'ML models', 'consumer apps', 'enterprise SaaS'], i)}. ` +
      `Open to ${pick(['2026 graduates', '2026 & 2027 graduates', 'final-year students', 'all branches'], i + 1)}.`

    const requirements =
      `- Minimum 65% in 10th, 12th and B.Tech\n` +
      `- No active backlogs\n` +
      `- Strong fundamentals in ${pick(LANG_POOL, i)} and ${pick(LANG_POOL, i + 1)}\n` +
      `- Good communication skills\n` +
      `- Willingness to relocate to ${location}`

    const job = await prisma.job.create({
      data: {
        title: `${title} — ${rec.company.name}`,
        company: rec.company.name,
        created_by: createdBy,
        ctc,
        location,
        description,
        requirements,
        status,
      },
    })

    // Rounds
    const tmpl = pick(ROUND_TEMPLATES, i)
    for (let r = 0; r < tmpl.length; r++) {
      const dayOffset = (i + 1) * 2 + r * 5
      const d = new Date()
      d.setDate(d.getDate() + dayOffset)
      await prisma.round.create({
        data: {
          job_id: job.id,
          title: tmpl[r],
          sort_order: r + 1,
          date: d,
          description: `${tmpl[r]} for ${rec.company.name} — ${title}.`,
        },
      })
    }

    jobs.push(job)
  }
  return jobs
}

async function seedApplications(students, jobs) {
  // Rounds are indexed so we can set current_round_id for mid-pipeline apps.
  const roundsByJob = {}
  for (const j of jobs) {
    roundsByJob[j.id] = await prisma.round.findMany({
      where: { job_id: j.id },
      orderBy: { sort_order: 'asc' },
      select: { id: true },
    })
  }

  let created = 0
  // About 2 applications per student on average → ~80 apps across 15 jobs
  const target = 80
  const seen = new Set()
  let k = 0
  while (created < target && k < target * 5) {
    const s = students[k % students.length]
    const j = jobs[(k * 3) % jobs.length]
    const key = `${s.id}-${j.id}`
    k++
    if (seen.has(key)) continue
    seen.add(key)

    const status = pick(APP_STATUSES, k)
    let current_round_id = null
    const rounds = roundsByJob[j.id]
    if (rounds && rounds.length) {
      if (status === 'test_scheduled') current_round_id = rounds[0].id
      else if (status === 'interview_scheduled') current_round_id = rounds[Math.min(1, rounds.length - 1)].id
      else if (status === 'shortlisted') current_round_id = rounds[0].id
      else if (status === 'selected') current_round_id = rounds[rounds.length - 1].id
    }

    await prisma.application.create({
      data: {
        job_id: j.id,
        student_id: s.id,
        status,
        current_round_id,
      },
    })

    // Round candidates for applications that are past "applied" stage
    if (current_round_id) {
      await prisma.roundCandidate.upsert({
        where: {
          round_id_student_id: { round_id: current_round_id, student_id: s.id },
        },
        update: {
          status: status === 'selected' ? 'cleared' : status === 'rejected' ? 'rejected' : 'pending',
        },
        create: {
          round_id: current_round_id,
          student_id: s.id,
          status: status === 'selected' ? 'cleared' : status === 'rejected' ? 'rejected' : 'pending',
        },
      })
    }

    created++
  }
  return created
}

async function seedEvents(tpo, admin) {
  // Wipe existing demo events so run is deterministic
  await prisma.event.deleteMany({
    where: { created_by: { in: [tpo.id, admin.id] } },
  })

  const today = new Date()
  const events = [
    { title: 'Pre-Placement Talk: Infosys', daysFromNow: 2, time: '10:00 AM', company: 'Infosys',
      description: 'Infosys HR will present career paths, training programs, and the hiring process.' },
    { title: 'Flipkart Campus Drive', daysFromNow: 5, time: '09:30 AM', company: 'Flipkart',
      description: 'Coding test followed by 2 rounds of technical interviews. Auditorium.' },
    { title: 'Resume Building Workshop', daysFromNow: 7, time: '02:00 PM', company: null,
      description: 'Hands-on session by the placement cell on crafting an industry-ready resume.' },
    { title: 'Mock Aptitude Test', daysFromNow: 10, time: '11:00 AM', company: null,
      description: 'Practice aptitude test modelled on common campus assessments.' },
    { title: 'TCS NQT Registration Deadline', daysFromNow: 12, time: '06:00 PM', company: 'TCS',
      description: 'Last day to register for the TCS National Qualifier Test.' },
    { title: 'Zomato Interview Day', daysFromNow: 14, time: '09:00 AM', company: 'Zomato',
      description: 'Final round interviews for shortlisted candidates. Lab-3.' },
    { title: 'System Design Masterclass', daysFromNow: 18, time: '04:00 PM', company: null,
      description: 'Senior alumni from Razorpay and Swiggy share system-design fundamentals.' },
    { title: 'Paytm Group Discussion', daysFromNow: 21, time: '10:30 AM', company: 'Paytm',
      description: 'GD round for shortlisted applicants. Seminar Hall.' },
    { title: 'Placement Orientation — Batch 2027', daysFromNow: 25, time: '11:00 AM', company: null,
      description: 'Kick-off session for the upcoming batch: rules, portal walkthrough, Q&A.' },
    { title: 'Zoho Coding Challenge', daysFromNow: 30, time: '09:00 AM', company: 'Zoho',
      description: 'On-campus coding round conducted by Zoho. Lab-1 & Lab-2.' },
  ]

  let count = 0
  for (const e of events) {
    const d = new Date(today)
    d.setDate(d.getDate() + e.daysFromNow)
    await prisma.event.create({
      data: {
        title: e.title,
        description: e.description,
        date: d,
        time: e.time,
        company: e.company,
        created_by: count % 2 === 0 ? tpo.id : admin.id,
      },
    })
    count++
  }
  return count
}

// ───────────────────────────── main ─────────────────────────────────────────

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗')
  console.log('║   Placement Portal — DEMO DATA SEEDER                       ║')
  console.log('╠══════════════════════════════════════════════════════════════╣')
  console.log(`║   All demo accounts use email domain: @${DEMO_DOMAIN}  ║`)
  console.log(`║   Shared password for every demo login: ${DEMO_PASSWORD}                ║`)
  console.log('╚══════════════════════════════════════════════════════════════╝')

  console.log('\n[1/5] Seeding staff (admin / TPO / HOD)…')
  const { admin, tpo, hod } = await seedStaff()
  console.log(`      ✓ admin=${admin.email}\n      ✓ tpo=${tpo.email}\n      ✓ hod=${hod.email}`)

  console.log('\n[2/5] Seeding recruiters + company profiles…')
  const recruiters = await seedRecruiters()
  console.log(`      ✓ ${recruiters.length} recruiters`)

  console.log('\n[3/5] Seeding students + student profiles…')
  const students = await seedStudents(40)
  console.log(`      ✓ ${students.length} students`)

  console.log('\n[4/5] Seeding jobs + rounds + applications + round candidates…')
  const jobs = await seedJobs(recruiters, tpo)
  const appCount = await seedApplications(students, jobs)
  console.log(`      ✓ ${jobs.length} jobs  |  ${appCount} applications (rounds & candidates linked)`)

  console.log('\n[5/5] Seeding placement events…')
  const eventCount = await seedEvents(tpo, admin)
  console.log(`      ✓ ${eventCount} events`)

  console.log('\n────────────────────────────────────────────────────────────────')
  console.log('✅  Demo data seeded successfully.')
  console.log('\n Sample logins (password: Demo@1234):')
  console.log(`   • Admin      →  admin@${DEMO_DOMAIN}`)
  console.log(`   • TPO        →  tpo@${DEMO_DOMAIN}`)
  console.log(`   • HOD        →  hod@${DEMO_DOMAIN}`)
  console.log(`   • Recruiter  →  recruiter.flipkart@${DEMO_DOMAIN}`)
  console.log(`   • Student    →  ${students[0].email}`)
  console.log('\n To wipe all demo data later:  node scripts/clear-demo.js')
  console.log('────────────────────────────────────────────────────────────────')
}

main()
  .catch((err) => {
    console.error('\n❌  Demo seed failed:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
