import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectMongo, isMongoConfigured } from '@/lib/mongoose'
import { Order } from '@/models'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })
  if (!isMongoConfigured()) return NextResponse.json({ ok: false, message: 'DB not configured' }, { status: 400 })

  const { id } = await params
  const body = await req.json().catch(() => ({})) as { status?: string }
  if (!body.status) return NextResponse.json({ ok: false, message: 'status required' }, { status: 400 })
  try {
    await connectMongo()
    const updated = await Order.findByIdAndUpdate(id, { status: body.status }, { new: true })
    return NextResponse.json({ ok: true, order: updated })
  } catch (e) {
    return NextResponse.json({ ok: false, message: (e as Error).message }, { status: 500 })
  }
}
