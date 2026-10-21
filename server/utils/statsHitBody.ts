/**
 * Parse le corps d’un hit stats, comme l’ancien PHP :
 * json_decode(php://input) quel que soit le Content-Type
 * (sendBeacon envoie souvent text/plain + JSON).
 */
export function parseStatsHitBody(
  raw: string | Record<string, unknown> | null | undefined,
  formPath?: string | null
): Record<string, unknown> {
  let data: Record<string, unknown> = {}

  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    data = raw
  } else if (typeof raw === 'string' && raw !== '') {
    try {
      const decoded = JSON.parse(raw) as unknown
      if (decoded && typeof decoded === 'object' && !Array.isArray(decoded)) {
        data = decoded as Record<string, unknown>
      }
    } catch {
      /* pas du JSON */
    }
  }

  if (Object.keys(data).length === 0 && formPath != null && formPath !== '') {
    data = { path: formPath }
  }

  return data
}
