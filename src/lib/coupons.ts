import type { AdminCoupon } from '@/store/useAdminStore'

export type CouponState =
  | 'valid' // every rule passes — applicable right now
  | 'eligible-soon' // dormant but actionable (min-order not met, user can fix by adding items)
  | 'dead' // expired / inactive / usage exhausted — not shown to customers

export type CouponView = {
  coupon: AdminCoupon
  state: CouponState
  /** Convenience flag: state === 'valid'. */
  valid: boolean
  /** Human-readable reason it isn't applicable (empty when valid). */
  reason: string
  /** Discount in ₹ this coupon would produce against the supplied subtotal. */
  discount: number
  /** Display label like "10% OFF" or "₹100 OFF". */
  label: string
  /** Short subtitle for the chip / banner. */
  subtitle: string
  /** Best deal among currently valid coupons. */
  isBest?: boolean
}

function formatLabel(c: AdminCoupon): string {
  return c.discountType === 'percent' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`
}

function formatSubtitle(c: AdminCoupon): string {
  const parts: string[] = []
  if (c.minOrder && c.minOrder > 0) parts.push(`Min order ₹${c.minOrder.toLocaleString('en-IN')}`)
  if (c.expiresAt) parts.push(`Expires ${c.expiresAt.slice(0, 10)}`)
  if (c.usageLimit !== undefined) {
    const left = Math.max(0, c.usageLimit - c.usedCount)
    if (left > 0 && left <= 25) parts.push(`Only ${left} left`)
  }
  if (!parts.length) parts.push('Limited time')
  return parts.join(' · ')
}

/** Compute the ₹ discount this coupon delivers against a given subtotal. */
function computeDiscount(c: AdminCoupon, subtotal: number): number {
  if (subtotal <= 0) return 0
  const raw = c.discountType === 'percent' ? subtotal * (c.discountValue / 100) : c.discountValue
  return Math.max(0, Math.min(subtotal, Math.round(raw)))
}

/** Classify a single coupon against the current subtotal & date. */
function evaluate(c: AdminCoupon, subtotal: number): { state: CouponState; reason: string } {
  if (!c.active) return { state: 'dead', reason: 'Coupon is currently inactive' }
  if (c.expiresAt) {
    const exp = new Date(c.expiresAt).getTime()
    if (Number.isFinite(exp) && Date.now() > exp) {
      return { state: 'dead', reason: 'Coupon expired' }
    }
  }
  if (c.usageLimit !== undefined && c.usedCount >= c.usageLimit) {
    return { state: 'dead', reason: 'Coupon usage limit reached' }
  }
  if (c.minOrder && subtotal < c.minOrder) {
    const need = c.minOrder - subtotal
    return {
      state: 'eligible-soon',
      reason: `Add ₹${need.toLocaleString('en-IN')} more (min ₹${c.minOrder.toLocaleString(
        'en-IN',
      )})`,
    }
  }
  return { state: 'valid', reason: '' }
}

function makeView(c: AdminCoupon, subtotal: number): CouponView {
  const { state, reason } = evaluate(c, subtotal)
  const discount = state === 'valid' ? computeDiscount(c, subtotal) : 0
  return {
    coupon: c,
    state,
    valid: state === 'valid',
    reason,
    discount,
    label: formatLabel(c),
    subtitle: formatSubtitle(c),
  }
}

/**
 * Customer-facing coupon list. Returns valid + eligible-soon coupons only;
 * expired / inactive / exhausted ones are hidden because they confuse customers.
 *
 * Sorted: valid (highest discount first, marked BEST) → eligible-soon (closest to threshold first).
 * Deduplicated by code (last-write-wins, case-insensitive).
 */
export function buildAvailableCoupons(
  adminCoupons: AdminCoupon[],
  subtotal: number,
): CouponView[] {
  // Deduplicate by code (case-insensitive). Later entries override earlier ones.
  const map = new Map<string, AdminCoupon>()
  adminCoupons.forEach((c) => {
    map.set(c.code.trim().toUpperCase(), c)
  })

  const views = Array.from(map.values())
    .map((c) => makeView(c, subtotal))
    .filter((v) => v.state !== 'dead')

  const valid = views.filter((v) => v.valid).sort((a, b) => b.discount - a.discount)
  const eligibleSoon = views
    .filter((v) => v.state === 'eligible-soon')
    .sort(
      (a, b) =>
        (a.coupon.minOrder ?? Infinity) - (b.coupon.minOrder ?? Infinity),
    )

  if (valid.length > 0) valid[0].isBest = true
  return [...valid, ...eligibleSoon]
}

/**
 * Look up a coupon by code (case-insensitive). Returns the full view (including
 * `state`/`reason`) so callers can decide whether to apply or surface an error.
 * Returns null only when the code is genuinely unknown.
 */
export function resolveCoupon(
  code: string,
  adminCoupons: AdminCoupon[],
  subtotal: number,
): CouponView | null {
  if (!code) return null
  const upper = code.trim().toUpperCase()
  const found = adminCoupons.find((c) => c.code.toUpperCase() === upper)
  if (!found) return null
  return makeView(found, subtotal)
}
