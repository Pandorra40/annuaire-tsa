import type { Association, Praticien } from '../types/index'
import { descriptionAssociation, descriptionPraticien } from './meta'
import { normaliserUrl } from './url'

const SITE = 'https://www.annuaire-tsa.fr'

type JsonLd = Record<string, unknown>

function adressePostale(
  adresse?: string | null,
  ville?: string | null,
  departement?: string | null,
  codePostal?: string | null
): JsonLd | undefined {
  if (!adresse && !ville && !departement && !codePostal) return undefined
  const postal: JsonLd = {
    '@type': 'PostalAddress',
    'addressCountry': 'FR'
  }
  if (adresse) postal.streetAddress = adresse
  if (ville) postal.addressLocality = ville
  if (departement) postal.addressRegion = departement
  if (codePostal) postal.postalCode = codePostal
  return postal
}

/** Normalise un téléphone FR vers E.164 (+33…) quand c’est un mobile/fixe à 10 chiffres. */
export function telephoneE164(tel?: string | null): string | undefined {
  if (!tel) return undefined
  const digits = tel.replace(/\D/g, '')
  if (digits.length === 10 && digits.startsWith('0')) {
    return `+33${digits.slice(1)}`
  }
  if (digits.length === 11 && digits.startsWith('33')) {
    return `+${digits}`
  }
  if (tel.trim().startsWith('+')) return tel.trim()
  return tel.trim() || undefined
}

/**
 * Type Schema.org le plus juste d'après la profession affichée sur la fiche.
 * Pas de Physician pour un psychologue / orthophoniste : ce n'est pas un médecin.
 */
function typeSchemaPraticien(type: string): string | string[] {
  if (type === 'Structure') return 'MedicalBusiness'
  if (type === 'Psychiatre' || type === 'Pédopsychiatre') return 'Physician'
  // jobTitle est une propriété Person — multi-type Person + ProfessionalService.
  return ['Person', 'ProfessionalService']
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
    'name': p.nom,
    'url': ficheUrl,
    'description': descriptionPraticien(p)
  }

  if (p.type === 'Structure') {
    schema.additionalType = p.type
  } else if (p.type === 'Psychiatre' || p.type === 'Pédopsychiatre') {
    schema.medicalSpecialty = p.type === 'Pédopsychiatre'
      ? 'https://schema.org/Psychiatric'
      : 'https://schema.org/Psychiatric'
  } else {
    schema.jobTitle = p.type
  }

  const address = adressePostale(
    p.adresse,
    p.ville,
    p.departement,
    (p as Praticien & { code_postal?: string }).code_postal
  )
  if (address) schema.address = address

  // Second lieu si renseigné.
  const address2 = adressePostale(p.adresse2, p.ville2, p.departement2)
  if (address2) {
    const lieux: JsonLd[] = []
    if (address) lieux.push({ '@type': 'Place', 'address': address })
    lieux.push({ '@type': 'Place', 'address': address2 })
    schema.location = lieux
  }

  const tel = telephoneE164(p.telephone)
  if (tel) schema.telephone = tel

  const site = normaliserUrl(p.site_web)
  if (site) schema.sameAs = [site.startsWith('http://') ? site.replace(/^http:\/\//, 'https://') : site]

  if (p.created_at) {
    const jour = p.created_at.slice(0, 10)
    schema.datePublished = jour
    schema.dateModified = jour
  }

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
    'name': a.nom,
    'url': ficheUrl
  }

  schema.description = descriptionAssociation(a)

  if (a.type_association) schema.additionalType = a.type_association

  const address = adressePostale(a.adresse, a.ville, a.departement)
  if (address) schema.address = address

  const tel = telephoneE164(a.telephone)
  if (tel) schema.telephone = tel
  if (a.email) schema.email = a.email

  const site = normaliserUrl(a.site_web)
  if (site) schema.sameAs = [site.startsWith('http://') ? site.replace(/^http:\/\//, 'https://') : site]

  return schema
}

/** Fil d'Ariane Schema.org. */
export function jsonLdFilAriane(items: { name: string, path: string }[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, i) => ({
      '@type': 'ListItem',
      'position': i + 1,
      'name': item.name,
      'item': item.path === '/' ? `${SITE}/` : `${SITE}${item.path}`
    }))
  }
}

/** Organisation médicale (CRA). */
export function jsonLdOrganisationMedicale(opts: {
  name: string
  url?: string
  description?: string
  address?: { street?: string, postalCode?: string, locality?: string }
  telephone?: string
  email?: string
  areaServed?: string[]
}): JsonLd {
  const schema: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalOrganization',
    'name': opts.name
  }
  if (opts.url) {
    schema.url = opts.url
    schema.sameAs = [opts.url]
  }
  if (opts.description) schema.description = opts.description
  if (opts.address) {
    schema.address = {
      '@type': 'PostalAddress',
      'addressCountry': 'FR',
      ...(opts.address.street ? { streetAddress: opts.address.street } : {}),
      ...(opts.address.postalCode ? { postalCode: opts.address.postalCode } : {}),
      ...(opts.address.locality ? { addressLocality: opts.address.locality } : {})
    }
  }
  const tel = telephoneE164(opts.telephone)
  if (tel) schema.telephone = tel
  if (opts.email) schema.email = opts.email
  if (opts.areaServed?.length) schema.areaServed = opts.areaServed
  return schema
}
