/**
 * Consolide l'hôte sur www + retire le slash final (sauf /).
 * OpenResty / Node : .htaccess Apache n'est plus lu pour ces redirections.
 */
export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  // Assets et API : ne pas toucher.
  if (
    url.pathname.startsWith('/_nuxt/')
    || url.pathname.startsWith('/api/')
    || url.pathname.startsWith('/fonts/')
  ) {
    return
  }

  const host = (getRequestHeader(event, 'x-forwarded-host')
    || getRequestHeader(event, 'host')
    || '').split(':')[0].toLowerCase()

  let pathname = url.pathname
  let changed = false

  if (pathname.length > 1 && pathname.endsWith('/')) {
    pathname = pathname.replace(/\/+$/, '') || '/'
    changed = true
  }

  if (host === 'annuaire-tsa.fr') {
    return sendRedirect(
      event,
      `https://www.annuaire-tsa.fr${pathname}${url.search}`,
      301
    )
  }

  if (changed) {
    return sendRedirect(event, `${pathname}${url.search}`, 301)
  }
})
