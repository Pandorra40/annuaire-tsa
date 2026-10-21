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

    const url = `${base}/stats-hit`
    const body = JSON.stringify({ path })
    // fetch keepalive en priorité : Content-Type application/json fiable.
    // sendBeacon en secours (certains navigateurs forcent text/plain).
    void fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
      credentials: 'omit'
    }).catch(() => {
      try {
        if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
          navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }))
        }
      } catch {
        /* ignore */
      }
    })
  }

  // Première vue
  if (import.meta.client) {
    envoyer(router.currentRoute.value.path)
  }

  router.afterEach((to) => {
    envoyer(to.path)
  })
})
