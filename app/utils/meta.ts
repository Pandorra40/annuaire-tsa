import type { Association, Praticien } from '../types/index'

/**
 * Échappe les esperluettes d'une description de page.
 *
 * unhead échappe correctement le contenu de <title>, mais pas la valeur de
 * l'attribut `content` d'une balise <meta>. Une association nommée « Inclu&Nous »
 * produisait donc `content="Inclu&Nous — …"`, du HTML invalide.
 *
 * À n'appliquer qu'aux chaînes construites à partir de la base : les textes
 * écrits en dur dans le code n'en ont pas besoin.
 */
export function echapperMeta(texte: string): string {
  return texte.replace(/&(?![a-zA-Z]+;|#\d+;|#x[0-9a-fA-F]+;)/g, '&amp;')
}

/** Cible Bing / Google pour l’extrait SERP (~120–160 caractères visibles). */
const LIMITE_DESCRIPTION = 160

/**
 * Coupe au dernier espace avant la limite, avec ellipsis si besoin.
 * Compte en caractères JS (texte brut avant échappement HTML).
 */
export function tronquerPourDescription(texte: string, limite = LIMITE_DESCRIPTION): string {
  if (texte.length <= limite) return texte
  let coupe = texte.slice(0, limite - 1)
  const dernierEspace = coupe.lastIndexOf(' ')
  if (dernierEspace > limite * 0.6) coupe = coupe.slice(0, dernierEspace)
  return coupe.trimEnd() + '…'
}

function lieuPraticien(p: Praticien): string {
  if (p.ville?.trim() && p.departement) return `${p.ville.trim()} (${p.departement})`
  if (p.ville?.trim()) return p.ville.trim()
  if (p.departement) return `département ${p.departement}`
  return ''
}

/**
 * Meta description d’une fiche praticien (texte brut, ~120–160 car.).
 * À passer dans echapperMeta() avant useSeoMeta.
 * Extras (téléconsultation, âges) ajoutés seulement s’ils tiennent dans la limite.
 */
export function descriptionPraticien(p: Praticien): string {
  const lieu = lieuPraticien(p)
  // Formulation assez courte pour laisser de la place aux extras, tout en
  // restant ≥ ~110 car. une fois le suffixe ajouté (cible Bing).
  let s = `Consultez la fiche de ${p.nom} — ${p.type} spécialisé autisme (TSA)`
  if (lieu) s += ` à ${lieu}`

  const suffixe = '. Annuaire collaboratif et gratuit.'
  // Téléconsultation avant les âges : plus court, plus utile en extrait SERP.
  const extras: string[] = []
  if (p.teleconsultation) extras.push('téléconsultation possible')
  if (p.ages?.length) extras.push(`public : ${p.ages.join(', ').toLowerCase()}`)
  for (const extra of extras) {
    const tentative = `${s} — ${extra}`
    if (tentative.length + suffixe.length <= LIMITE_DESCRIPTION) s = tentative
  }

  return tronquerPourDescription(s + suffixe)
}

function lieuAssociation(a: Association): string {
  const ville = a.ville?.trim()
  if (ville && a.departement) return `${ville} (${a.departement})`
  if (ville) return ville
  if (a.departement) return `département ${a.departement}`
  return ''
}

/**
 * Meta description d’une fiche association (texte brut).
 * Préfère le résumé publié s’il est assez riche ; sinon type + lieu + nom.
 */
export function descriptionAssociation(a: Association): string {
  const resume = a.description?.trim().replace(/\s+/g, ' ')
  const lieu = lieuAssociation(a)

  if (resume && resume.length >= 40) {
    const avecNom = resume.includes(a.nom) ? resume : `${resume} — ${a.nom}`
    return tronquerPourDescription(`${avecNom}. Annuaire TSA.`)
  }

  let s = a.nom
  if (a.type_association?.trim()) s += ` — ${a.type_association.trim()}`
  if (lieu) s += ` à ${lieu}`
  else s += ' — association spécialisée autisme / TSA'
  s += '. Annuaire TSA.'
  return tronquerPourDescription(s)
}
