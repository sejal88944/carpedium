import Link from 'next/link'

type Item = { label: string; href?: string }

export function Breadcrumbs({ items, dark }: { items: Item[]; dark?: boolean }) {
  // Drop a leading "Home" the caller may have added — the component already
  // renders its own Home link, otherwise we'd see "Home / Home / ...".
  const rest =
    items[0]?.label?.toLowerCase() === 'home' && items[0]?.href === '/' ? items.slice(1) : items

  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-sm">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link
            href="/"
            className={dark ? 'text-zinc-400 hover:text-white' : 'text-slate-500 hover:text-brand'}
          >
            Home
          </Link>
        </li>
        {rest.map((item, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className={dark ? 'text-zinc-600' : 'text-slate-400'}>/</span>
            {item.href ? (
              <Link
                href={item.href}
                className={dark ? 'text-zinc-400 hover:text-white' : 'text-slate-500 hover:text-brand'}
              >
                {item.label}
              </Link>
            ) : (
              <span className={dark ? 'text-white' : 'text-slate-800 dark:text-zinc-200'}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
