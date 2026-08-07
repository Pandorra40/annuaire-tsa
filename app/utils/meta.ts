/**
 * Échappe les esperluettes d'une description de page.
 *
 * unhead échappe correctement le contenu de <title>, mais pas la valeur de
 * l'attribut `content` d'une balise <meta>. Une association nommée « Inclu&Nous »
 * produisait donc `content="Inclu&Nous — …"`, du HTML invalide.
 *
 * À n'appliquer qu'aux chaînes construites à partir de la base : les textes
 * écrits en dur dans le code n'en ont pas besoin.
 */
export function echapperMeta(texte: string): string {
  return texte.replace(/&(?![a-zA-Z]+;|#\d+;|#x[0-9a-fA-F]+;)/g, '&amp;')
}
