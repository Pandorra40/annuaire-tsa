/**
 * Longueur d'un texte une fois rendu dans un <title>, en tenant compte de
 * l'échappement HTML — une apostrophe devient `&#x27;` (6 caractères) dans
 * le HTML produit, pas 1.
 *
 * Un premier calcul comparait `nom.length` en JavaScript à 70, sans tenir
 * compte de cet échappement. Deux associations passaient ce contrôle et
 * échouaient pourtant la validation HTML au build — leur nom contient une ou
 * deux apostrophes, qui suffisaient à dépasser la limite une fois encodées.
 */
function longueurTitreEncode(texte: string): number {
  let supplement = 0
  for (const c of texte) {
    if (c === '&') supplement += 4 // & → &amp;
    else if (c === '<' || c === '>') supplement += 3 // < → &lt; / > → &gt;
    else if (c === '"' || c === '\'') supplement += 5 // " → &quot; / ' → &#x27;
  }
  return texte.length + supplement
}

/**
 * Renvoie `texte` tel quel s'il tient dans `limite` une fois encodé, sinon
 * une version coupée au dernier espace avant la limite, suivie d'une
 * ellipsis. La coupe elle-même retire un caractère à la fois plutôt que de
 * couper à `limite` pile : un caractère échappé compte pour plusieurs, une
 * coupe naïve sur l'index pourrait donc encore dépasser.
 */
export function tronquerPourTitre(texte: string, limite = 70): string {
  if (longueurTitreEncode(texte) <= limite) return texte

  let coupe = texte
  while (coupe.length > 0 && longueurTitreEncode(coupe + '…') > limite) {
    coupe = coupe.slice(0, -1)
  }
  // Coupe au dernier espace, pour ne pas trancher un mot en deux — sauf si
  // cet espace est trop tôt dans le texte, où couper un mot reste préférable
  // à perdre l'essentiel du titre.
  const dernierEspace = coupe.lastIndexOf(' ')
  if (dernierEspace > limite * 0.6) coupe = coupe.slice(0, dernierEspace)
  return coupe.trimEnd() + '…'
}
