export function initiales(nom: string) {
  const parts = nom.trim().split(' ').filter(p => p !== 'Dr' && p !== 'Dr.')
  // Déstructuré puis testé, plutôt que parts[0][0] : TypeScript ne sait pas
  // déduire d'un `length >= 2` que les deux premiers éléments existent.
  // charAt plutôt que [0] pour la même raison — il renvoie '' hors limites.
  const [premier, second] = parts
  if (premier && second) return (premier.charAt(0) + second.charAt(0)).toUpperCase()
  return nom.substring(0, 2).toUpperCase()
}

export function isNew(createdAt?: string) {
  if (!createdAt) return false
  return (new Date().getTime() - new Date(createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000
}
