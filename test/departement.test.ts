import { describe, expect, it } from 'vitest'
import { departementDepuisSaisie } from '../app/utils/departement'

describe('departementDepuisSaisie', () => {
  it('déduit un département métropolitain d\'un code postal', () => {
    expect(departementDepuisSaisie('33000')).toBe('33')
    expect(departementDepuisSaisie('75015')).toBe('75')
  })

  it('rend la Corse sous sa forme 2A / 2B et non « 20 »', () => {
    expect(departementDepuisSaisie('20000')).toBe('2A') // Ajaccio
    expect(departementDepuisSaisie('20137')).toBe('2A') // Porto-Vecchio
    expect(departementDepuisSaisie('20200')).toBe('2B') // Bastia
    expect(departementDepuisSaisie('20250')).toBe('2B') // Corte
  })

  it('respecte une saisie corse explicite, qui fait autorité sur le seuil', () => {
    expect(departementDepuisSaisie('2A')).toBe('2A')
    expect(departementDepuisSaisie('2b')).toBe('2B')
  })

  it('garde les trois chiffres de l\'outre-mer', () => {
    expect(departementDepuisSaisie('97400')).toBe('974') // La Réunion
    expect(departementDepuisSaisie('97100')).toBe('971') // Guadeloupe
    expect(departementDepuisSaisie('98800')).toBe('988') // Nouvelle-Calédonie
  })

  // Le cœur du bug corrigé : dans l'admin, le champ contient le département
  // déjà enregistré. L'ancien substring(0, 2) le réécrivait à chaque
  // sauvegarde, transformant « 974 » en « 97 », qui n'existe pas.
  it('ne tronque pas un numéro de département déjà valide', () => {
    expect(departementDepuisSaisie('974')).toBe('974')
    expect(departementDepuisSaisie('971')).toBe('971')
    expect(departementDepuisSaisie('33')).toBe('33')
  })

  it('complète un département métropolitain écrit sans son zéro', () => {
    expect(departementDepuisSaisie('7')).toBe('07')
  })

  it('ignore les espaces et la casse', () => {
    expect(departementDepuisSaisie('  33000 ')).toBe('33')
    expect(departementDepuisSaisie('2a')).toBe('2A')
  })

  it('renvoie une chaîne vide pour une saisie absente ou non numérique', () => {
    expect(departementDepuisSaisie('')).toBe('')
    expect(departementDepuisSaisie(null)).toBe('')
    expect(departementDepuisSaisie(undefined)).toBe('')
    expect(departementDepuisSaisie('inconnu')).toBe('')
  })
})
