import { describe, expect, it } from 'vitest'
import { tronquerPourTitre } from '../app/utils/titreSeo'

describe('tronquerPourTitre', () => {
  it('laisse intact un texte déjà sous la limite', () => {
    expect(tronquerPourTitre('Autisme Gironde — Associations TSA')).toBe('Autisme Gironde — Associations TSA')
  })

  // Cas réel : 51 caractères en JS, mais l'apostrophe devient &#x27; (6
  // caractères) dans le HTML rendu — le total dépasse 70 une fois encodé,
  // alors qu'un compte naïf sur la chaîne JS reste en dessous.
  it('tronque un titre qui ne dépasse la limite qu\'une fois l\'apostrophe encodée', () => {
    const titre = 'PMMCA Papa Maman et Moi Construisons avec l\'Autisme — Associations TSA'
    const resultat = tronquerPourTitre(titre)
    expect(resultat).not.toBe(titre)
    expect(resultat.endsWith('…')).toBe(true)
  })

  // Cas réel : le nom seul (81 caractères, deux apostrophes) dépasse déjà la
  // limite avant même d'ajouter un suffixe.
  it('tronque un nom qui dépasse la limite à lui seul', () => {
    const nom = 'CERESA Centre Régional d\'Education et de Services pour l\'Autisme en Midi-Pyrénées'
    const resultat = tronquerPourTitre(nom)
    expect(resultat).not.toBe(nom)
    expect(resultat.length).toBeLessThan(nom.length)
  })

  it('ne coupe pas au milieu d\'un mot quand un espace convenable existe', () => {
    const resultat = tronquerPourTitre('a'.repeat(50) + ' ' + 'b'.repeat(50))
    expect(resultat).toBe('a'.repeat(50) + '…')
  })
})
