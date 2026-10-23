import type { Association, Praticien } from '../types/index'
import { normaliserUrl } from './url'

const SITE = 'https://www.annuaire-tsa.fr'

type JsonLd = Record<string, unknown>

function adressePostale(
  adresse?: string | null,
  ville?: string | null,
  departement?: string | null
): JsonLd | undefined {
  if (!adresse && !ville && !departement) return undefined
  const postal: JsonLd = {
    '@type': 'PostalAddress',
    addressCountry: 'FR'
  }
  if (adresse) postal.streetAddress = adresse
  if (ville) postal.addressLocality = ville
  // Le département est un code (ex. « 31 »), pas une région administrative.
  if (departement) postal.addressRegion = departement
  return postal
}

/**
 * Type Schema.org le plus juste d'après la profession affichée sur la fiche.
 * Pas de Physician pour un psychologue / orthophoniste : ce n'est pas un médecin.
 */
function typeSchemaPraticien(type: string): string {
  if (type === 'Structure') return 'MedicalBusiness'
  if (type === 'Psychiatre' || type === 'Pédopsychiatre') return 'Physician'
  return 'ProfessionalService'
}

/**
 * JSON-LD d'une fiche praticien — uniquement des champs déjà publics.
 * Pas d'aggregateRating, pas d'horaires inventés.
 */
export function jsonLdPraticien(p: Praticien): JsonLd {
  const ficheUrl = `${SITE}/praticien/${p.id}`
  const schema: JsonLd = {
    '@context': 'https://schema.org',
    '@type': typeSchemaPraticien(p.type),
    '@id': ficheUrl,
    name: p.nom,
    url: ficheUrl,
    description: `${p.type} spécialisé TSA à ${p.ville}`
  }

  // jobTitle pour une personne / professionnel ; medicalSpecialty pour un médecin.
  if (p.type === 'Structure') {
    schema.additionalType = p.type
  } else if (p.type === 'Psychiatre' || p.type === 'Pédopsychiatre') {
    schema.medicalSpecialty = p.type
  } else {
    schema.jobTitle = p.type
  }

  const address = adressePostale(p.adresse, p.ville, p.departement)
  if (address) schema.address = address

  // Téléphone uniquement s'il est affiché sur la fiche (même règle que le template).
  if (p.telephone) schema.telephone = p.telephone

  const site = normaliserUrl(p.site_web)
  if (site) schema.sameAs = [site]

  return schema
}

/**
 * JSON-LD d'une fiche association — NGO / Organization selon les données publiées.
 */
export function jsonLdAssociation(a: Association): JsonLd {
  const ficheUrl = `${SITE}/association/${a.id}`
  const schema: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NGO',
    '@id': ficheUrl,
    name: a.nom,
    url: ficheUrl
  }

  if (a.description) schema.description = a.description
  else if (a.type_association && a.ville) {
    schema.description = `${a.type_association} à ${a.ville}`
  }

  if (a.type_association) schema.additionalType = a.type_association

  const address = adressePostale(a.adresse, a.ville, a.departement)
  if (address) schema.address = address

  if (a.telephone) schema.telephone = a.telephone
  if (a.email) schema.email = a.email

  const site = normaliserUrl(a.site_web)
  if (site) schema.sameAs = [site]

  return schema
}
