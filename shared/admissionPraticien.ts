/**
 * Catalogue + règles d’admission des suggestions / fiches praticien.
 * Source unique pour le front et l’API Nitro — ne pas recopier ailleurs.
 */

export const TYPES_PRATICIENS = [
  'Psychiatre',
  'Pédopsychiatre',
  'Psychologue',
  'Neuropsychologue',
  'Orthophoniste',
  'Ergothérapeute',
  'Psychomotricien',
  'Structure'
] as const

export type TypePraticien = (typeof TYPES_PRATICIENS)[number]

export const MSG_RPPS_OBLIGATOIRE
  = 'Le numéro RPPS ou ADELI est obligatoire. Sans identifiant, la fiche ne peut pas être publiée.'

export const MSG_CONTACT_OBLIGATOIRE
  = 'Indiquez un téléphone ou un site web : sans moyen de contact, la fiche ne peut pas être publiée.'

export function isValidPraticienType(type: string): boolean {
  return (TYPES_PRATICIENS as readonly string[]).includes(type)
}

export function nettoyerIdentifiant(valeur: string | null | undefined): string {
  return String(valeur ?? '').trim().replace(/[\s.-]/g, '')
}

export function messageFormatIdentifiant(type: string): string {
  return type === 'Structure'
    ? 'Identifiant invalide : 14 chiffres (SIRET) ou 9 chiffres (FINESS) attendus.'
    : 'Identifiant invalide : 11 chiffres (RPPS) ou 9 chiffres (ADELI) attendus.'
}

/** Format OK pour une valeur déjà nettoyée. Chaîne vide = pas de format à juger. */
export function identifiantAuFormat(brut: string, type: string): boolean {
  if (!brut) return true
  return type === 'Structure'
    ? /^\d{14}$|^\d{9}$/.test(brut)
    : /^\d{11}$|^\d{9}$/.test(brut)
}

/** Téléphone et/ou site web public — pas l’e-mail praticien. */
export function aMoyenContactPublie(
  telephone: string | null | undefined,
  siteWeb: string | null | undefined
): boolean {
  return Boolean((telephone ?? '').trim() || (siteWeb ?? '').trim())
}
