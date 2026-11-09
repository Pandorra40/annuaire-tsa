/**
 * Seuil unique : en dessous, la fiche association est trop pauvre pour
 * l'indexation. La page pose noindex, le sitemap omet l'URL.
 * Ne pas dupliquer ce nombre ailleurs.
 */
export const SEUIL_MOTS_FICHE_ASSOCIATION = 25

/**
 * Décide le noindex d'une fiche association.
 * Moins de 25 mots dans la description → noindex.
 * Fiche absente → pas de noindex (comportement historique de la page).
 */
export function associationEstNoindex(
  association: { description?: string | null } | null | undefined
): boolean {
  if (!association) return false
  const mots = (association.description || '').trim().split(/\s+/).filter(Boolean).length
  return mots < SEUIL_MOTS_FICHE_ASSOCIATION
}

/** Fiches association que le sitemap a le droit de lister. */
export function associationsIndexables<T extends { description?: string | null }>(
  associations: T[]
): T[] {
  return associations.filter(a => !associationEstNoindex(a))
}
