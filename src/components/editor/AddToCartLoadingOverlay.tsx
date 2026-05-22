'use client'

type Props = {
  message?: string
}

/** Blocks interaction while design export / cart save runs — prevents blank-screen confusion. */
export function AddToCartLoadingOverlay({ message = 'Preparing your design…' }: Props) {
  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-white/92 p-6 backdrop-blur-sm dark:bg-void/92"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex w-full max-w-sm flex-col items-center rounded-3xl border border-black/10 bg-white px-8 py-10 shadow-2xl dark:border-white/10 dark:bg-void-2">
        <div
          className="h-12 w-12 animate-spin rounded-full border-4 border-sky-200 border-t-brand"
          aria-hidden
        />
        <p className="mt-6 text-center font-display text-lg font-bold">{message}</p>
        <p className="mt-2 text-center text-sm text-slate-500 dark:text-zinc-400">
          Saving preview & cart… PDF generates next.
        </p>
      </div>
    </div>
  )
}
