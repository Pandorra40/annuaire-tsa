import { describe, expect, it } from 'vitest'
import {
  descriptionAssociation,
  descriptionPraticien,
  echapperMeta,
  tronquerPourDescription
} from '../app/utils/meta'
import type { Association, Praticien } from '../app/types/index'

const base: Praticien = {
  id: 272,
  nom: 'MALEZE Lise',
  type: 'Psychologue',
  ville: 'PARIS',
  departement: '75',
  teleconsultation: false,
  ages: [],
  confirmations: 0
}

describe('descriptionPraticien', () => {
  it('produit une description dans la fourchette SEO (~110–160 car.)', () => {
    const d = descriptionPraticien(base)
    expect(d.length).toBeGreaterThanOrEqual(110)
    expect(d.length).toBeLessThanOrEqual(160)
    expect(d).toContain('MALEZE Lise')
    expect(d).toContain('Psychologue')
    expect(d).toContain('PARIS')
    expect(d).toContain('(75)')
    expect(d).toMatch(/autisme \(TSA\)/)
  })

  it('ajoute la téléconsultation si elle tient dans la limite', () => {
    const d = descriptionPraticien({
      ...base,
      teleconsultation: true
    })
    expect(d.toLowerCase()).toContain('téléconsultation')
    expect(d.length).toBeLessThanOrEqual(160)
  })

  it('n’ajoute les âges que s’ils tiennent sans tronquer le cœur', () => {
    const court = descriptionPraticien({
      ...base,
      nom: 'Dupont',
      ages: ['Enfant']
    })
    expect(court.toLowerCase()).toContain('enfant')

    const long = descriptionPraticien({
      ...base,
      ages: ['Enfant', 'Adolescent', 'Adulte'],
      teleconsultation: true
    })
    // Téléconsultation prioritaire ; les âges peuvent être omis si trop long
    expect(long.toLowerCase()).toContain('téléconsultation')
    expect(long.length).toBeLessThanOrEqual(160)
    expect(long.endsWith('…')).toBe(false)
  })
})

describe('descriptionAssociation', () => {
  it('utilise le résumé publié quand il est assez riche', () => {
    const a: Association = {
      id: 235,
      nom: 'GEM TSA AUBUSSON 23',
      ville: '',
      departement: '23',
      type_association: "Association de personnes concernées, GEM",
      description: "Le GEM : un lieu d'écoute et de rencontres pour des personnes avec un Trouble du Spectre de l'Autisme"
    }
    const d = descriptionAssociation(a)
    expect(d).toContain('écoute')
    expect(d).toContain('GEM TSA AUBUSSON 23')
    expect(d.length).toBeLessThanOrEqual(160)
    // Plus de « à  (23) » vide
    expect(d).not.toMatch(/à\s+\(/)
  })

  it('compose type + lieu si pas de résumé', () => {
    const d = descriptionAssociation({
      id: 1,
      nom: 'Atypic',
      ville: 'Antibes',
      departement: '06',
      type_association: 'Association de familles'
    })
    expect(d).toContain('Atypic')
    expect(d).toContain('Association de familles')
    expect(d).toContain('Antibes')
    expect(d.length).toBeGreaterThanOrEqual(60)
  })
})

describe('tronquerPourDescription / echapperMeta', () => {
  it('coupe au mot avec ellipsis', () => {
    expect(tronquerPourDescription('a'.repeat(50) + ' ' + 'b'.repeat(50), 60)).toBe('a'.repeat(50) + '…')
  })

  it('échappe les & bruts', () => {
    expect(echapperMeta('Inclu&Nous')).toBe('Inclu&amp;Nous')
  })
})
