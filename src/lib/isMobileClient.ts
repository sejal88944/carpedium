/** Client-only mobile / touch device detection. */
export function isMobileClient(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Android|iPhone|iPad|iPod|Mobile|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  )
}

/** Lower Fabric export multiplier on phones to avoid OOM / blank screen. */
export function artworkExportMultiplier(): number {
  return isMobileClient() ? 2 : 4
}
