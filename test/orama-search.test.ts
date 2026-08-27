import { describe, expect, it } from 'vitest'
import { create, insertMultiple, search } from '@orama/orama'
import { docPraticien, SCHEMA_PRATICIEN, PRATICIEN_SEARCH_PROPERTIES } from '../app/search/documents'

describe('Orama recherche praticiens', () => {
  const praticien = {
    id: 1,
    nom: 'Maëva Dupont',
    type: 'Psychologue',
    ville: 'Bordeaux',
    departement: '33',
    ages: ['Enfant'],
    teleconsultation: false,
    confirmations: 0,
    fait_bilans: 1
  }

  async function chercher(term: string) {
    const db = create({ schema: SCHEMA_PRATICIEN, language: 'french' })
    await insertMultiple(db, [docPraticien(praticien)])
    return search(db, {
      term,
      properties: [...PRATICIEN_SEARCH_PROPERTIES],
      tolerance: 1,
      limit: 10
    })
  }

  it('trouve sans accent (maeva)', async () => {
    const r = await chercher('maeva')
    expect(r.count).toBeGreaterThan(0)
  })

  it('tolère une faute sur la ville (bordeau)', async () => {
    const r = await chercher('bordeau')
    expect(r.count).toBeGreaterThan(0)
  })

  it('trouve par préfixe de ville (bor)', async () => {
    const r = await chercher('bor')
    expect(r.count).toBeGreaterThan(0)
  })
})
