import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectMongo, isMongoConfigured } from '@/lib/mongoose'
import { Setting } from '@/models'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })
  if (!isMongoConfigured()) return NextResponse.json({ ok: true, settings: {} })
  try {
    await connectMongo()
    const docs = await Setting.find().lean()
    const settings: Record<string, unknown> = {}
    for (const d of docs) settings[d.key] = d.value
    return NextResponse.json({ ok: true, settings })
  } catch (e) {
    return NextResponse.json({ ok: false, message: (e as Error).message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })
  if (!isMongoConfigured()) return NextResponse.json({ ok: false, message: 'DB not configured' }, { status: 400 })
  try {
    const body = (await req.json()) as Record<string, unknown>
    await connectMongo()
    const ops = Object.entries(body).map(([key, value]) =>
      Setting.findOneAndUpdate({ key }, { value }, { upsert: true, new: true }),
    )
    await Promise.all(ops)
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ ok: false, message: (e as Error).message }, { status: 500 })
  }
}
