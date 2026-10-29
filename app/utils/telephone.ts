/**
 * Affichage lisible d’un téléphone FR (groupes de 2), sans toucher à l’href tel:.
 */
export function formatTelephoneAffichage(tel?: string | null): string {
  if (!tel) return ''
  const digits = tel.replace(/\D/g, '')
  if (digits.length === 10 && digits.startsWith('0')) {
    return digits.replace(/(\d{2})(?=\d)/g, '$1 ').trim()
  }
  if (digits.length === 11 && digits.startsWith('33')) {
    const nat = `0${digits.slice(2)}`
    return nat.replace(/(\d{2})(?=\d)/g, '$1 ').trim()
  }
  return tel.trim()
}

/** href tel: compact. */
export function telephoneHref(tel?: string | null): string {
  if (!tel) return ''
  const raw = tel.replace(/[\s.-]/g, '')
  return raw ? `tel:${raw}` : ''
}
