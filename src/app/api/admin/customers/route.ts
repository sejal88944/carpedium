import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectMongo, isMongoConfigured } from '@/lib/mongoose'
import { Customer } from '@/models'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })
  if (!isMongoConfigured()) return NextResponse.json({ ok: true, customers: [] })
  try {
    await connectMongo()
    const customers = await Customer.find().sort({ createdAt: -1 }).lean()
    return NextResponse.json({ ok: true, customers })
  } catch (e) {
    return NextResponse.json({ ok: false, message: (e as Error).message }, { status: 500 })
  }
}
