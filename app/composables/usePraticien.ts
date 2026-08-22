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

// Une couleur par métier, réparties sur tout le cercle chromatique plutôt que
// groupées dans le bleu-violet — la première version tombait à quatre métiers
// sur sept dans le même bleu-violet. Toutes vérifiées à plus de 4,5:1 avec du
// blanc, qui s'écrit dessus. « Structure » n'est pas un métier : gris chaud,
// pas de couleur de métier.
const COULEURS_METIER: Record<string, string> = {
  Psychiatre: '#BE123C',
  Pédopsychiatre: '#9A3412',
  Psychologue: '#4338CA',
  Neuropsychologue: '#A21CAF',
  Orthophoniste: '#0369A1',
  Ergothérapeute: '#15803D',
  Psychomotricien: '#B45309',
  Structure: '#57534E'
}

export function couleurMetier(type: string) {
  return COULEURS_METIER[type] ?? '#57534E'
}
