/**
 * Compte une vue page côté navigateur uniquement.
 * Les crawlers / bots qui n'exécutent pas ce JS ne sont pas comptés ;
 * l'API filtre aussi les User-Agent suspects.
 */
export default defineNuxtPlugin(() => {
  const router = useRouter()
  const config = useRuntimeConfig()
  const base = String(config.public.apiBase || '/api').replace(/\/$/, '')

  let dernierPath = ''

  function envoyer(path: string) {
    if (!path || path === dernierPath) return
    if (path.startsWith('/admin') || path.startsWith('/stats') || path.startsWith('/api')) return
    dernierPath = path

    const url = `${base}/stats_hit.php`
    const body = JSON.stringify({ path })
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
        const blob = new Blob([body], { type: 'application/json' })
        if (navigator.sendBeacon(url, blob)) return
      }
    } catch {
      // fallback fetch
    }
    void fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
      credentials: 'omit'
    }).catch(() => {})
  }

  // Première vue
  if (import.meta.client) {
    envoyer(router.currentRoute.value.path)
  }

  router.afterEach((to) => {
    envoyer(to.path)
  })
})
