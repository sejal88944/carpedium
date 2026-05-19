import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import mongoose from 'mongoose'
import nodemailer from 'nodemailer'

const app = express()
const PORT = process.env.PORT || 8787

app.disable('x-powered-by')
app.use(helmet({ crossOriginResourcePolicy: false }))
app.use(cors({ origin: true }))
app.use(express.json({ limit: '10mb' }))

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
})
app.use('/api/', apiLimiter)

const ORDER_STATUSES = ['confirmed', 'printing', 'shipped', 'delivered', 'cancelled']

const productSchema = new mongoose.Schema(
  {
    title: String,
    slug: String,
    category: String,
    price: Number,
    colors: [String],
    sizes: [String],
    images: [String],
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
)

const orderSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true },
    items: Array,
    total: Number,
    status: { type: String, enum: ORDER_STATUSES, default: 'confirmed' },
    customer: Object,
    payment: { method: String, paid: { type: Boolean, default: false }, razorpayId: String },
    note: String,
  },
  { timestamps: true },
)

let Product, Order

async function connect() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.warn('[mongo] MONGODB_URI not set — running in stub mode')
    return
  }
  await mongoose.connect(uri)
  Product = mongoose.models.Product || mongoose.model('Product', productSchema)
  Order = mongoose.models.Order || mongoose.model('Order', orderSchema)
  console.log('[mongo] connected')
}

let transporter = null
function getMailer() {
  if (transporter !== null) return transporter
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    transporter = false
    return false
  }
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  })
  return transporter
}

async function sendMail({ subject, html, replyTo }) {
  const t = getMailer()
  if (!t) {
    console.warn('[mail] SMTP not configured — skipping email')
    return false
  }
  const to = process.env.SMTP_TO || process.env.SMTP_USER
  await t.sendMail({
    from: process.env.SMTP_FROM || `AASHA-SM TECH <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
    replyTo,
  })
  return true
}

app.get('/api/health', (_req, res) =>
  res.json({ ok: true, service: 'aasha-sm-api', mongo: mongoose.connection.readyState === 1 }),
)

app.get('/api/products', async (_req, res) => {
  if (!Product) return res.json({ products: [] })
  const products = await Product.find({ active: true }).lean()
  res.json({ products })
})

app.post('/api/orders', async (req, res) => {
  const code = `ASM-${Date.now().toString(36).toUpperCase()}`
  const payload = { ...req.body, code, status: 'confirmed' }
  let saved = null
  if (Order) {
    saved = await Order.create(payload)
  }
  sendMail({
    subject: `New order ${code}`,
    replyTo: req.body?.customer?.email,
    html: `<h2>New custom T-shirt order</h2>
      <p><b>Code:</b> ${code}</p>
      <p><b>Total:</b> ₹${req.body?.total || 0}</p>
      <pre>${JSON.stringify(req.body, null, 2)}</pre>`,
  }).catch((e) => console.warn('[mail-order]', e.message))
  res.json({ ok: true, orderId: saved?._id || code, code, status: 'confirmed' })
})

app.get('/api/orders/:code', async (req, res) => {
  if (!Order) return res.status(404).json({ ok: false })
  const order = await Order.findOne({ code: req.params.code }).lean()
  if (!order) return res.status(404).json({ ok: false })
  res.json({ ok: true, order })
})

app.patch('/api/orders/:code', async (req, res) => {
  if (!Order) return res.status(404).json({ ok: false })
  const { status } = req.body || {}
  if (!ORDER_STATUSES.includes(status)) return res.status(400).json({ ok: false, error: 'invalid_status' })
  const order = await Order.findOneAndUpdate({ code: req.params.code }, { status }, { new: true }).lean()
  if (!order) return res.status(404).json({ ok: false })
  res.json({ ok: true, order })
})

app.post('/api/contact', async (req, res) => {
  const { name, email, phone, message } = req.body || {}
  if (!name || !message) return res.status(400).json({ ok: false, error: 'missing_fields' })
  sendMail({
    subject: `New website enquiry from ${name}`,
    replyTo: email,
    html: `<h2>Contact enquiry</h2>
      <p><b>Name:</b> ${name}</p>
      <p><b>Email:</b> ${email || '-'}</p>
      <p><b>Phone:</b> ${phone || '-'}</p>
      <p><b>Message:</b><br/>${(message || '').replace(/\n/g, '<br/>')}</p>`,
  }).catch((e) => console.warn('[mail-contact]', e.message))
  res.json({ ok: true })
})

connect().catch((e) => console.warn(e.message))

app.listen(PORT, () => console.log(`API http://127.0.0.1:${PORT}`))
