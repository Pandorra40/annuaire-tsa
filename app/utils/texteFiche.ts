/**
 * Ne plus « restaurer » d’apostrophes à l’affichage : l’ancienne regex
 * (`l`/`d`/`s`/`c`… + voyelle) cassait le français correct
 * (« comportement » → « c'omportement », « depuis » → « d'epuis »).
 * Les textes en base sont déjà élidés quand il le faut.
 */

/**
 * Restaure les retours à la ligne stockés en littéral `\n` ou en `<br>`.
 */
export function normaliserRetoursLigne(texte: string): string {
  return texte
    .replace(/\\n/g, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/\r\n/g, '\n')
}

export function preparerTexteFiche(texte: string): string {
  return normaliserRetoursLigne(texte)
}
