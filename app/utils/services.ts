/**
 * Découpe le champ `services` (une chaîne séparée par des virgules) en une
 * liste de services normalisés.
 *
 * La donnée source contient des retours à la ligne littéraux au milieu de
 * certains libellés — « Groupe\nd'habiletés sociales » au lieu de « Groupe
 * d'habiletés sociales ». Un simple `.trim()` par élément ne les corrige
 * pas : il faut réduire toute suite d'espaces (y compris les sauts de ligne)
 * à un seul, sans quoi le même service est compté deux fois sous deux
 * graphies différentes — vérifié sur les 290 associations publiées, où ça
 * faisait passer « Rencontres / échanges » de 210 à deux entrées de 166 et 44.
 */
export function parserServices(brut: string | null | undefined): string[] {
  if (!brut) return []
  return brut
    .split(',')
    .map(s => s.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
}

/**
 * Services proposés comme filtres sur la liste des associations.
 *
 * Choisis parmi les 18 libellés distincts mesurés sur les associations
 * publiées, selon le même critère que pour les praticiens : une mauvaise
 * réponse sur ce service fait-elle perdre du temps à une famille qui le
 * cherche précisément ? « Autre » est exclu — 104 occurrences, mais un
 * fourre-tout n'identifie rien, comme le tarif chez les praticiens.
 */
export const SERVICES_ASSOCIATIONS = [
  'Rencontres / échanges',
  'Activités',
  'Information',
  'Formation / sensibilisation',
  'Information sur les démarches administratives',
  'Guidance parentale',
  'Accompagnement éducatif',
  'Groupe d\'habiletés sociales',
  'Information et accompagnement juridique',
  'Répit',
  'Groupe fratrie',
  'Groupe de parole'
] as const
