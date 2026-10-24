export const MAINTENANCE_DEFAULT_MESSAGE
  = 'Le site est temporairement en maintenance pour une mise à jour. Merci de revenir dans quelques minutes.'

export const MAINTENANCE_MESSAGE_MAX = 500

/** Chemins toujours accessibles pendant la maintenance (hors session admin). */
export function isMaintenanceBypassPath(pathname: string): boolean {
  const path = pathname.split('?')[0] || '/'
  if (path === '/maintenance') return true
  if (path === '/api/maintenance') return true
  if (path.startsWith('/admin')) return true
  if (path === '/api/auth' || path.startsWith('/api/auth/')) return true
  if (path.startsWith('/_nuxt/') || path.startsWith('/_ipx/')) return true
  if (path.startsWith('/fonts/') || path.startsWith('/icons/')) return true
  if (
    path === '/favicon.ico'
    || path === '/favicon.svg'
    || path === '/logo-tsa.svg'
    || path === '/robots.txt'
    || path === '/sitemap.xml'
    || path.startsWith('/sitemap')
    || path === '/sw.js'
    || path === '/manifest.webmanifest'
    || path === '/manifest.webmanifest.js'
  ) {
    return true
  }
  return false
}

/** Texte public : pas de HTML, longueur bornée, repli sur le message par défaut. */
export function sanitizeMaintenanceMessage(brut: unknown): string {
  const texte = String(brut ?? '')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (texte === '') return MAINTENANCE_DEFAULT_MESSAGE
  if ([...texte].length > MAINTENANCE_MESSAGE_MAX) {
    return [...texte].slice(0, MAINTENANCE_MESSAGE_MAX).join('')
  }
  return texte
}
