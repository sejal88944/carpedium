import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectMongo, isMongoConfigured } from '@/lib/mongoose'
import { Coupon } from '@/models'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })
  if (!isMongoConfigured()) return NextResponse.json({ ok: true, coupons: [] })
  try {
    await connectMongo()
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean()
    return NextResponse.json({ ok: true, coupons })
  } catch (e) {
    return NextResponse.json({ ok: false, message: (e as Error).message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })
  if (!isMongoConfigured()) return NextResponse.json({ ok: false, message: 'DB not configured' }, { status: 400 })
  try {
    const body = await req.json()
    await connectMongo()
    const created = await Coupon.create(body)
    return NextResponse.json({ ok: true, coupon: created })
  } catch (e) {
    return NextResponse.json({ ok: false, message: (e as Error).message }, { status: 500 })
  }
}
