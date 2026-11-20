/** How much this site stores and may store, as the browser reports it; null where it can't say. */
export async function getStorageEstimate(): Promise<{
  usage: number
  quota: number
} | null> {
  try {
    const { usage, quota } = (await navigator.storage?.estimate()) ?? {}
    return typeof usage === 'number' && typeof quota === 'number' && quota > 0
      ? { usage, quota }
      : null
  } catch {
    return null
  }
}
