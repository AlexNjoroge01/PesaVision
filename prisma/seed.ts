import { Plan, SubStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'

async function main() {
  const email = 'alexnjoroge102@gmail.com'
  const password = 'Titan@123'
  const hashedPassword = await bcrypt.hash(password, 12)

  // Create or update the super user
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      role: 'SUPER_USER',
      plan: Plan.PRO,
      password: hashedPassword,
    },
    create: {
      email,
      name: 'Alex Njoroge',
      password: hashedPassword,
      role: 'SUPER_USER',
      plan: Plan.PRO,
      emailVerified: new Date(),
    },
  })

  // Ensure subscription exists
  const existingSubscription = await prisma.subscription.findUnique({
    where: { userId: user.id },
  })

  if (!existingSubscription) {
    await prisma.subscription.create({
      data: {
        userId: user.id,
        plan: Plan.PRO,
        status: SubStatus.ACTIVE,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000), // 10 years
      },
    })
  } else {
    // Update existing subscription to PRO
    await prisma.subscription.update({
      where: { userId: user.id },
      data: {
        plan: Plan.PRO,
        status: SubStatus.ACTIVE,
        currentPeriodEnd: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000), // 10 years
      },
    })
  }

  console.log('Super user seeded successfully:')
  console.log(`  Email: ${email}`)
  console.log(`  Role: SUPER_USER`)
  console.log(`  Plan: PRO`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
