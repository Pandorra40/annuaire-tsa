/**
 * Numéro de département à partir de ce qui a été saisi — code postal complet
 * ou numéro déjà normalisé.
 *
 * Remplace les `substring(0, 2)` qui traînaient dans suggerer.vue et
 * admin/modifier.vue, et qui se trompaient dans deux cas :
 *
 *  - la Corse, dont les départements s'écrivent 2A et 2B et non « 20 » ;
 *  - l'outre-mer, dont les numéros font trois chiffres — 97400 donnait « 97 »,
 *    qui n'existe pas, et la fiche devenait introuvable par département.
 *
 * Le cas admin était pire encore : le champ y contient le département déjà
 * enregistré, pas un code postal. Chaque sauvegarde d'une fiche ultramarine
 * réécrivait donc « 974 » en « 97 ». D'où l'acceptation ici des deux formes en
 * entrée, et surtout la règle de ne jamais tronquer un numéro déjà valide.
 *
 * La frontière corse est une approximation assumée : la répartition officielle
 * entre 2A et 2B comporte quelques exceptions qu'un simple seuil ne capture
 * pas. Une saisie explicite de « 2A » ou « 2B » est donc respectée telle
 * quelle, ce qui laisse le dernier mot à l'humain sur les cas limites.
 */

// Au-delà, les codes postaux corses relèvent de la Haute-Corse (2B) ; en deçà,
// de la Corse-du-Sud (2A).
const DERNIER_CODE_CORSE_DU_SUD = 20199

export function departementDepuisSaisie(valeur: string | null | undefined): string {
  const saisie = (valeur ?? '').trim().toUpperCase()
  if (!saisie) return ''

  // Une saisie corse explicite fait autorité sur le calcul ci-dessous.
  if (saisie === '2A' || saisie === '2B') return saisie

  const chiffres = saisie.replace(/\D/g, '')
  if (!chiffres) return ''

  // Code postal complet : c'est le seul cas où il y a quelque chose à déduire.
  if (chiffres.length === 5) {
    if (chiffres.startsWith('20')) {
      return Number(chiffres) <= DERNIER_CODE_CORSE_DU_SUD ? '2A' : '2B'
    }
    // Outre-mer : 971 à 978, plus les collectivités du Pacifique en 98x.
    if (chiffres.startsWith('97') || chiffres.startsWith('98')) {
      return chiffres.substring(0, 3)
    }
    return chiffres.substring(0, 2)
  }

  // Un chiffre seul désigne un département métropolitain écrit sans son zéro.
  if (chiffres.length === 1) return '0' + chiffres

  // Deux ou trois chiffres : c'est déjà un numéro de département, on le rend
  // intact. C'est précisément ce que l'ancien substring(0, 2) détruisait.
  if (chiffres.length <= 3) return chiffres

  // Saisie incomplète ou fautive : on retombe sur les deux premiers chiffres,
  // faute de mieux, plutôt que de renvoyer du vide.
  return chiffres.substring(0, 2)
}
