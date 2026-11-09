import { describe, expect, it } from 'vitest'
import {
  associationEstNoindex,
  associationsIndexables,
  SEUIL_MOTS_FICHE_ASSOCIATION
} from '../app/utils/associationIndexation'

function descriptionDe(nombreMots: number): string {
  return Array.from({ length: nombreMots }, (_, i) => `mot${i + 1}`).join(' ')
}

describe('associationEstNoindex', () => {
  it('laisse indexable une fiche absente', () => {
    expect(associationEstNoindex(null)).toBe(false)
    expect(associationEstNoindex(undefined)).toBe(false)
  })

  it('pose noindex sous 25 mots, y compris description vide', () => {
    expect(SEUIL_MOTS_FICHE_ASSOCIATION).toBe(25)
    expect(associationEstNoindex({ description: '' })).toBe(true)
    expect(associationEstNoindex({ description: '   \n  ' })).toBe(true)
    expect(associationEstNoindex({ description: null })).toBe(true)
    expect(associationEstNoindex({ description: descriptionDe(24) })).toBe(true)
    // Cas réel du 9 novembre 2026 : /association/1, six mots.
    expect(associationEstNoindex({
      description: 'Accompagner le jeune adulte vers l\'emploi'
    })).toBe(true)
  })

  it('laisse indexer dès 25 mots, espaces et retours à la ligne compris', () => {
    expect(associationEstNoindex({ description: descriptionDe(25) })).toBe(false)
    expect(associationEstNoindex({ description: descriptionDe(40) })).toBe(false)
    // Un retour à la ligne compte comme un séparateur de mot, comme sur la page.
    expect(associationEstNoindex({
      description: `  ${descriptionDe(24)}\n\ndernier  `
    })).toBe(false)
  })
})

describe('associationsIndexables', () => {
  it('retire du sitemap une fiche noindex et conserve une fiche indexée', () => {
    const fiches = [
      { id: 1, description: 'Accompagner le jeune adulte vers l\'emploi' },
      { id: 8, description: '' },
      { id: 15, description: descriptionDe(14) },
      { id: 280, description: descriptionDe(26) }
    ]

    const urls = associationsIndexables(fiches).map(a => `/association/${a.id}`)

    expect(urls).toEqual(['/association/280'])
    expect(urls).not.toContain('/association/1')
    expect(urls).not.toContain('/association/8')
    expect(urls).not.toContain('/association/15')
  })
})
