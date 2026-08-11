/**
 * Met un texte en minuscules et lui retire ses accents, pour comparer une
 * saisie à une donnée.
 *
 * Sur un téléphone, personne ne tape « Béziers » avec son accent. Sans cette
 * normalisation, la recherche ne renvoyait rien et laissait croire qu'aucun
 * praticien n'exerce dans la ville — le pire résultat possible pour un
 * annuaire de soin.
 *
 * NFD sépare la lettre de son accent, et l'intervalle U+0300–U+036F retire les
 * diacritiques ainsi isolés.
 */
export function normaliserRecherche(texte: string): string {
  return texte
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}
