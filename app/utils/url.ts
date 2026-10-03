/**
 * Préfixe https:// quand le schéma manque — même règle que validateUrl côté API.
 * Vide → chaîne vide (le formulaire envoie alors null).
 */
export function normaliserUrl(valeur: string | null | undefined): string {
  const url = (valeur ?? '').trim()
  if (!url) return ''
  if (url.startsWith('//')) return `https:${url}`
  if (!/^[a-z][a-z0-9+.-]*:/i.test(url)) return `https://${url}`
  return url
}
