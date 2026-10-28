/** Slug URL pour une ville (accents → ASCII, espaces → tirets). */
export function slugVille(ville: string): string {
  return ville
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Titre affiché à partir du slug (approximation ; la vraie casse vient des données). */
export function titreDepuisSlug(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}
