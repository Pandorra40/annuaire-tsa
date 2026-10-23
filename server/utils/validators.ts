import { apiError } from '~~/server/utils/errors'

export function agesToString(ages?: string[] | null): string | null {
  if (!ages || ages.length === 0) return null
  return ages.join(',')
}

export function agesToArray(ages?: string | null): string[] {
  if (!ages) return []
  return ages.split(',')
}

export function validPraticienTypes(): string[] {
  return [
    'Psychiatre',
    'Pédopsychiatre',
    'Psychologue',
    'Neuropsychologue',
    'Orthophoniste',
    'Ergothérapeute',
    'Psychomotricien',
    'Structure'
  ]
}

export function isValidPraticienType(type: string): boolean {
  return validPraticienTypes().includes(type)
}

export function normaliserIdentifiant(valeur: string | null | undefined, type: string): string | null {
  const brut = String(valeur ?? '').trim().replace(/[\s.-]/g, '')
  if (brut === '') return null

  const attendu = type === 'Structure'
    ? ['14 chiffres (SIRET) ou 9 chiffres (FINESS)', /^\d{14}$|^\d{9}$/]
    : ['11 chiffres (RPPS) ou 9 chiffres (ADELI)', /^\d{11}$|^\d{9}$/] as const

  if (!(attendu[1] as RegExp).test(brut)) {
    apiError(400, {
      error: `Identifiant invalide : ${attendu[0]} attendus.`,
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

export function sanitizeHtml(html?: string | null): string | null {
  if (!html) return null
  let cleaned = html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '')
  const allowed = new Set(['p', 'br', 'strong', 'em', 'u', 'h2', 'h3', 'ul', 'ol', 'li', 'blockquote', 'a'])
  // strip disallowed tags but keep text
  cleaned = cleaned.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, (full, tag: string) => {
    const t = tag.toLowerCase()
    if (!allowed.has(t)) return ''
    return full
  })
  cleaned = cleaned.replace(
    /<([a-z][a-z0-9]*)((?:\s+[a-z][a-z0-9-]*(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)+)\s*\/?>/gi,
    (_m, tag: string, attrs: string) => {
      const t = tag.toLowerCase()
      if (t === 'a') {
        const href = attrs.match(/\bhref\s*=\s*(["'])(https?:\/\/[^"']+)\1/i)
        if (href) {
          const safe = href[2]
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
          return `<a href="${safe}" target="_blank" rel="noopener noreferrer">`
        }
      }
      return `<${t}>`
    }
  )
  return cleaned.trim()
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
