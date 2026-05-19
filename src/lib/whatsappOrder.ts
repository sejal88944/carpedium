import { COMPANY } from '@/data/brand'

export type WhatsAppOrderItem = {
  title: string
  qty: number
  price: number
  size?: string
  color?: string
  /** Cart thumbnail (data URL). Marks the item as a custom design in the message. */
  previewImage?: string
  /** Product slug — used to build a shareable product link in the message. */
  slug?: string
}

export type WhatsAppOrderOptions = {
  /**
   * If the customer just downloaded a custom-design PDF (e.g. from the
   * T-shirt designer's "Add to Cart"), set this so the message reminds them
   * to attach the file. wa.me cannot attach files itself.
   */
  pdfFileName?: string
  /** Optional pricing breakdown to show after the item list. */
  pricing?: {
    subtotal: number
    discount?: number
    discountLabel?: string
    shipping?: number
    total: number
  }
}

function productLink(slug: string): string {
  const base = COMPANY.siteUrl.replace(/\/$/, '')
  return `${base}/shop/${slug}`
}

/** Build a WhatsApp deep-link URL for the given cart-style items. */
export function buildWhatsAppOrderUrl(
  items: WhatsAppOrderItem[],
  options: WhatsAppOrderOptions = {},
): string {
  const lines: string[] = []
  lines.push(`Hi *${COMPANY.shortName}* 👕`)
  lines.push(`I'd like to place an order:`)
  lines.push('')

  let itemTotal = 0
  let hasCustomDesign = false
  items.forEach((it, i) => {
    const subtotal = it.price * it.qty
    itemTotal += subtotal
    const extras = [it.size && `Size: ${it.size}`, it.color && `Color: ${it.color}`]
      .filter(Boolean)
      .join(' · ')
    lines.push(`${i + 1}. ${it.title}`)
    lines.push(`   Qty: ${it.qty} × ₹${it.price} = ₹${subtotal}`)
    if (extras) lines.push(`   ${extras}`)
    if (it.slug) lines.push(`   🔗 ${productLink(it.slug)}`)
    if (it.previewImage) {
      hasCustomDesign = true
      lines.push(`   🎨 Custom design (PDF will be attached)`)
    }
  })

  lines.push('')
  if (options.pricing) {
    const p = options.pricing
    lines.push('━━━━━━━━━━━━━━━━━━━')
    lines.push(`Subtotal: ₹${p.subtotal.toLocaleString('en-IN')}`)
    if (p.discount && p.discount > 0) {
      lines.push(`${p.discountLabel || 'Discount'}: −₹${p.discount.toLocaleString('en-IN')}`)
    }
    if (p.shipping !== undefined) {
      lines.push(`Shipping: ${p.shipping === 0 ? 'Free' : `₹${p.shipping.toLocaleString('en-IN')}`}`)
    }
    lines.push(`*Total: ₹${p.total.toLocaleString('en-IN')}*`)
    lines.push('━━━━━━━━━━━━━━━━━━━')
  } else {
    lines.push(`*Total: ₹${itemTotal.toLocaleString('en-IN')}*`)
  }
  lines.push('')

  if (hasCustomDesign || options.pdfFileName) {
    lines.push('📎 *Please attach the design PDF*')
    if (options.pdfFileName) {
      lines.push(`File: ${options.pdfFileName}`)
    }
    lines.push('(It was just downloaded to your device — tap the 📎 attach icon in WhatsApp and pick it from Downloads.)')
    lines.push('')
  }

  lines.push('Please confirm availability and share next steps. Thank you!')

  const text = encodeURIComponent(lines.join('\n'))
  return `https://wa.me/${COMPANY.whatsapp}?text=${text}`
}

/** Open the WhatsApp order chat in a new tab/window. Safe to call from browser only. */
export function openWhatsAppOrder(
  items: WhatsAppOrderItem[],
  options: WhatsAppOrderOptions = {},
) {
  if (typeof window === 'undefined') return
  const url = buildWhatsAppOrderUrl(items, options)
  window.open(url, '_blank', 'noopener,noreferrer')
}
