import { COMPANY } from '@/data/brand'

/**
 * FREE WhatsApp ordering flow — uses public wa.me link (no API key, no monthly fee).
 * Auto-fills product, quantity, size, color and design info for the merchant.
 */

export type WhatsAppOrderItem = {
  title: string
  qty: number
  size?: string
  color?: string
  price?: number
}

export type WhatsAppOrderPayload = {
  product?: string
  quantity?: number
  size?: string
  color?: string
  designNote?: string
  customerName?: string
  email?: string
  phone?: string
  city?: string
  address?: string
  pincode?: string
  state?: string
  totalEstimate?: number
  subtotal?: number
  discount?: number
  shipping?: number
  source?: string
  orderId?: string
  payment?: string
  items?: WhatsAppOrderItem[]
}

function formatInr(n: number) {
  return `₹${n.toLocaleString('en-IN')}`
}

function buildOrderMessage(payload: WhatsAppOrderPayload) {
  const lines: string[] = []
  if (payload.orderId) {
    lines.push(`Hi ${COMPANY.shortName}! New order *#${payload.orderId}* placed on the website:`)
  } else {
    lines.push(`Hi ${COMPANY.shortName}! I want to place a custom T-shirt order:`)
  }
  lines.push('')

  if (payload.items && payload.items.length) {
    lines.push('*Order items:*')
    payload.items.forEach((it, idx) => {
      const meta = [it.size ? `Size ${it.size}` : '', it.color ? it.color : '']
        .filter(Boolean)
        .join(' · ')
      const priceTxt =
        typeof it.price === 'number' ? ` — ${formatInr(it.price * it.qty)}` : ''
      lines.push(
        `${idx + 1}. ${it.title} × ${it.qty}${meta ? ` (${meta})` : ''}${priceTxt}`,
      )
    })
    lines.push('')
  } else {
    if (payload.product) lines.push(`• Product: ${payload.product}`)
    if (payload.quantity) lines.push(`• Quantity: ${payload.quantity}`)
    if (payload.size) lines.push(`• Size: ${payload.size}`)
    if (payload.color) lines.push(`• Color: ${payload.color}`)
    if (payload.designNote) lines.push(`• Design: ${payload.designNote}`)
  }

  if (typeof payload.subtotal === 'number')
    lines.push(`• Subtotal: ${formatInr(payload.subtotal)}`)
  if (typeof payload.discount === 'number' && payload.discount > 0)
    lines.push(`• Discount: −${formatInr(payload.discount)}`)
  if (typeof payload.shipping === 'number')
    lines.push(
      `• Shipping: ${payload.shipping === 0 ? 'Free' : formatInr(payload.shipping)}`,
    )
  if (typeof payload.totalEstimate === 'number')
    lines.push(`• *Total: ${formatInr(payload.totalEstimate)}*`)
  if (payload.payment) lines.push(`• Payment: ${payload.payment}`)

  if (
    payload.customerName ||
    payload.phone ||
    payload.email ||
    payload.address ||
    payload.city ||
    payload.pincode ||
    payload.state
  ) {
    lines.push('', '*Customer:*')
    if (payload.customerName) lines.push(`• Name: ${payload.customerName}`)
    if (payload.phone) lines.push(`• Phone: ${payload.phone}`)
    if (payload.email) lines.push(`• Email: ${payload.email}`)
    const addr = [payload.address, payload.city, payload.state, payload.pincode]
      .filter(Boolean)
      .join(', ')
    if (addr) lines.push(`• Address: ${addr}`)
  }

  if (payload.source) lines.push('', `From: ${payload.source}`)
  lines.push('', 'Please confirm the order and share design proof. Thank you!')
  return lines.join('\n')
}

export function whatsappOrderLink(payload: WhatsAppOrderPayload = {}) {
  const number = process.env.NEXT_PUBLIC_WHATSAPP || COMPANY.whatsapp
  const text = encodeURIComponent(buildOrderMessage(payload))
  return `https://wa.me/${number}?text=${text}`
}

export function whatsappChatLink(message?: string) {
  const number = process.env.NEXT_PUBLIC_WHATSAPP || COMPANY.whatsapp
  const text = message
    ? `?text=${encodeURIComponent(message)}`
    : '?text=' +
        encodeURIComponent(
          `Hi ${COMPANY.shortName}! I want to know more about your custom T-shirt printing.`,
        )
  return `https://wa.me/${number}${text}`
}
