import { TRUST_BADGES } from '@/data/site'

export function TrustBadges() {
  return (
    <div className="flex flex-wrap justify-center gap-3 md:gap-4">
      {TRUST_BADGES.map((b) => (
        <div
          key={b.label}
          className="glass flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold md:text-sm"
        >
          <span className="text-brand">{b.icon}</span>
          {b.label}
        </div>
      ))}
    </div>
  )
}
