/** Identifiant vidéo YouTube (11 caractères), ou null. */
export function idVideoYoutube(url: string): string | null {
  let u: URL
  try {
    u = new URL(url.trim())
  } catch {
    return null
  }

  const host = u.hostname.replace(/^www\./i, '').toLowerCase()
  const path = u.pathname
  let id: string | null = null

  if (host === 'youtu.be') {
    id = path.replace(/^\//, '').split('/')[0] || null
  } else if (['youtube.com', 'm.youtube.com', 'youtube-nocookie.com'].includes(host)) {
    if (path === '/watch') {
      id = u.searchParams.get('v')
    } else {
      const m = path.match(/^\/(?:shorts|embed|v)\/([^/]+)/)
      id = m?.[1] ?? null
    }
  }

  return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null
}

/** Adresse normalisée d'une chaîne YouTube (onglet Vidéos), ou null. */
export function urlChaineYoutube(url: string): string | null {
  let u: URL
  try {
    u = new URL(url.trim())
  } catch {
    return null
  }

  const host = u.hostname.replace(/^www\./i, '').toLowerCase()
  if (host !== 'youtube.com' && host !== 'm.youtube.com') return null

  const path = u.pathname.replace(/\/$/, '')
  const m = path.match(
    /^\/(@[A-Za-z0-9._-]{3,30}|channel\/UC[A-Za-z0-9_-]{22}|c\/[A-Za-z0-9._-]{1,60}|user\/[A-Za-z0-9._-]{1,60})(?:\/videos)?$/
  )
  if (!m) return null

  return `https://www.youtube.com/${m[1]}/videos`
}
