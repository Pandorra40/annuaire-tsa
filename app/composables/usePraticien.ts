export function initiales(nom: string) {
  const parts = nom.trim().split(' ').filter(p => p !== 'Dr' && p !== 'Dr.')
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return nom.substring(0, 2).toUpperCase()
}

export function isNew(createdAt?: string) {
  if (!createdAt) return false
  return (new Date().getTime() - new Date(createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000
}
