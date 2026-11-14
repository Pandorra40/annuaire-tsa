import { apiError } from '~~/server/utils/errors'
import {
  TYPES_PRATICIENS,
  identifiantAuFormat,
  isValidPraticienType,
  messageFormatIdentifiant,
  nettoyerIdentifiant
} from '#shared/admissionPraticien'

export { isValidPraticienType }

export function agesToString(ages?: string[] | null): string | null {
  if (!ages || ages.length === 0) return null
  return ages.join(',')
}

export function agesToArray(ages?: string | null): string[] {
  if (!ages) return []
  return ages.split(',')
}

export function validPraticienTypes(): string[] {
  return [...TYPES_PRATICIENS]
}

export function normaliserIdentifiant(valeur: string | null | undefined, type: string): string | null {
  const brut = nettoyerIdentifiant(valeur)
  if (brut === '') return null

  if (!identifiantAuFormat(brut, type)) {
    apiError(400, {
      error: messageFormatIdentifiant(type),
      field: 'adeli'
    })
  }
  return brut
}

export function validateLength(value: string, max: number, field: string): void {
  if ([...value].length > max) {
    apiError(400, `Le champ ${field} est trop long (max ${max} caractères).`)
  }
}

export function validateUrl(url: string | null | undefined, field = 'site_web'): string | null {
  if (!url) return null
  let u = String(url).trim()
  if (u === '') return null

  if (u.startsWith('//')) {
    u = 'https:' + u
  } else if (!/^[a-z][a-z0-9+.-]*:/i.test(u)) {
    u = 'https://' + u
  }

  let parsed: URL
  try {
    parsed = new URL(u)
  } catch {
    apiError(400, { error: 'URL invalide.', field })
  }
  const scheme = parsed.protocol.replace(':', '').toLowerCase()
  if (scheme !== 'http' && scheme !== 'https') {
    apiError(400, { error: 'URL invalide.', field })
  }
  validateLength(u, 255, field)
  return u
}

export function validateContactAuteur(valeur: unknown): string | null {
  const contact = String(valeur ?? '').trim()
  if (contact === '') return null
  // RFC-ish simple check (PHP FILTER_VALIDATE_EMAIL equivalent enough)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact) || contact.length > 254) {
    apiError(400, { error: 'Adresse email invalide.', field: 'contact_auteur' })
  }
  return contact
}
