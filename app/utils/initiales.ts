/**
 * Initiales affichées dans la pastille d'une association.
 *
 * Les mots de deux lettres ou moins sont écartés : « Autisme France Nord »
 * donne AF, mais « Le Cœur Bleu » donne CB et non LC — l'article n'apprend
 * rien. C'est un traitement distinct de celui des praticiens, qui écarte « Dr »
 * et rien d'autre (voir initiales() dans composables/usePraticien.ts), et de
 * celui des CRA, qui extrait un sigle (voir pages/cra.vue).
 *
 * Cette fonction était recopiée à l'identique dans association/[id].vue et
 * associations/index.vue.
 */
export function initialesStructure(nom: string) {
  const mots = nom.trim().split(' ').filter(m => m.length > 2)
  // Déstructuré puis testé, plutôt que mots[0][0] : TypeScript ne sait pas
  // déduire d'un `length >= 2` que les deux premiers éléments existent.
  const [premier, second] = mots
  if (premier && second) return (premier.charAt(0) + second.charAt(0)).toUpperCase()
  return nom.substring(0, 2).toUpperCase()
}
