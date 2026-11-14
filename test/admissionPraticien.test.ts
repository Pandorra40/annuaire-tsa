import { describe, expect, it } from 'vitest'
import {
  MSG_CONTACT_OBLIGATOIRE,
  MSG_RPPS_OBLIGATOIRE,
  TYPES_PRATICIENS,
  aMoyenContactPublie,
  identifiantAuFormat,
  isValidPraticienType,
  messageFormatIdentifiant,
  nettoyerIdentifiant
} from '../shared/admissionPraticien'

/**
 * Contrat d’admission suggestion / fiche — même module que UI + API.
 * (Pas de DB : pin du comportement métier.)
 */
describe('admission praticien', () => {
  it('expose le catalogue de types attendu', () => {
    expect(TYPES_PRATICIENS).toContain('Psychologue')
    expect(TYPES_PRATICIENS).toContain('Structure')
    expect(isValidPraticienType('Orthophoniste')).toBe(true)
    expect(isValidPraticienType('Dentiste')).toBe(false)
  })

  it('nettoie espaces et séparateurs d’identifiant', () => {
    expect(nettoyerIdentifiant(' 123 456-789.01 ')).toBe('12345678901')
    expect(nettoyerIdentifiant('')).toBe('')
    expect(nettoyerIdentifiant(null)).toBe('')
  })

  it('exige RPPS/ADELI pour une personne, pas pour une Structure vide', () => {
    expect(MSG_RPPS_OBLIGATOIRE).toMatch(/RPPS ou ADELI/)
    expect(nettoyerIdentifiant('')).toBe('')
    // Personne sans numéro → le formulaire / l’API refusent via MSG_RPPS_OBLIGATOIRE
    expect(identifiantAuFormat('', 'Psychologue')).toBe(true) // vide ≠ mauvais format
    expect(identifiantAuFormat('12345678901', 'Psychologue')).toBe(true)
    expect(identifiantAuFormat('123456789', 'Psychologue')).toBe(true) // ADELI 9
    expect(identifiantAuFormat('12345', 'Psychologue')).toBe(false)
  })

  it('accepte SIRET/FINESS pour Structure, refuse un format bancal', () => {
    expect(identifiantAuFormat('12345678901234', 'Structure')).toBe(true) // SIRET 14
    expect(identifiantAuFormat('123456789', 'Structure')).toBe(true) // FINESS 9
    expect(identifiantAuFormat('12345678901', 'Structure')).toBe(false) // 11 = RPPS perso
    expect(messageFormatIdentifiant('Structure')).toMatch(/SIRET/)
    expect(messageFormatIdentifiant('Psychologue')).toMatch(/RPPS/)
  })

  it('exige un moyen de contact publié (tél ou site)', () => {
    expect(aMoyenContactPublie('0600000000', null)).toBe(true)
    expect(aMoyenContactPublie('', 'https://exemple.fr')).toBe(true)
    expect(aMoyenContactPublie('  ', '')).toBe(false)
    expect(aMoyenContactPublie(null, null)).toBe(false)
    expect(MSG_CONTACT_OBLIGATOIRE).toMatch(/téléphone ou un site/)
  })
})
