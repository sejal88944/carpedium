import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectMongo, isMongoConfigured } from '@/lib/mongoose'
import { User } from '@/models'

export async function POST() {
  if (!isMongoConfigured()) {
    return NextResponse.json(
      { ok: false, message: 'MONGODB_URI not set' },
      { status: 400 },
    )
  }
  try {
    await connectMongo()
    const email = 'admin@gmail.com'
    const exists = await User.findOne({ email })
    if (exists) {
      return NextResponse.json({ ok: true, message: 'Admin already exists' })
    }
    const passwordHash = await bcrypt.hash('pass12345', 10)
    await User.create({ email, name: 'AASHA Admin', passwordHash, role: 'admin' })
    return NextResponse.json({ ok: true, message: 'Admin user created' })
  } catch (e) {
    return NextResponse.json({ ok: false, message: (e as Error).message }, { status: 500 })
  }
}
