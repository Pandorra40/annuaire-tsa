/**
 * Remet des apostrophes d’élision courantes perdues à l’import
 * (« lévaluation » → « l'évaluation », « denfants » → « d'enfants »).
 */
export function restaurerApostrophes(texte: string): string {
  return texte
    .replace(/\b([ldnmscjtLDNMSCJT])([aeiouàâäéèêëïîôöùûüAEIOUÀÂÄÉÈÊËÏÎÔÖÙÛÜ])/g, "$1'$2")
    .replace(/\b([Qq]u)([aeiouàâäéèêëïîôöùûüAEIOUÀÂÄÉÈÊËÏÎÔÖÙÛÜ])/g, "$1'$2")
}

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
  return restaurerApostrophes(normaliserRetoursLigne(texte))
}
