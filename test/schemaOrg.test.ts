import { describe, expect, it } from 'vitest'
import { jsonLdAssociation, jsonLdPraticien } from '../app/utils/schemaOrg'
import type { Association, Praticien } from '../app/types/index'

const basePraticien: Praticien = {
  id: 42,
  nom: 'Dr Marie Dupont',
  type: 'Psychiatre',
  ville: 'Toulouse',
  departement: '31',
  adresse: '1 rue Exemple',
  telephone: '05 00 00 00 00',
  site_web: 'doctolib.fr/dupont',
  teleconsultation: false,
  ages: ['Enfant'],
  confirmations: 3
}

describe('jsonLdPraticien', () => {
  it('mappe un psychiatre en Physician avec les champs publics', () => {
    const ld = jsonLdPraticien(basePraticien)
    expect(ld['@type']).toBe('Physician')
    expect(ld.name).toBe('Dr Marie Dupont')
    expect(ld.url).toBe('https://www.annuaire-tsa.fr/praticien/42')
    expect(ld.telephone).toBe('05 00 00 00 00')
    expect(ld.medicalSpecialty).toBe('Psychiatre')
    expect(ld.sameAs).toEqual(['https://doctolib.fr/dupont'])
    expect(ld.address).toMatchObject({
      '@type': 'PostalAddress',
      streetAddress: '1 rue Exemple',
      addressLocality: 'Toulouse',
      addressRegion: '31',
      addressCountry: 'FR'
    })
    expect(ld).not.toHaveProperty('aggregateRating')
  })

  it('mappe une structure en MedicalBusiness et un psychologue en ProfessionalService', () => {
    expect(jsonLdPraticien({ ...basePraticien, type: 'Structure' })['@type']).toBe('MedicalBusiness')
    expect(jsonLdPraticien({ ...basePraticien, type: 'Psychologue' })['@type']).toBe('ProfessionalService')
  })

  it('omet téléphone et sameAs s\'ils sont absents', () => {
    const ld = jsonLdPraticien({
      ...basePraticien,
      telephone: undefined,
      site_web: undefined
    })
    expect(ld).not.toHaveProperty('telephone')
    expect(ld).not.toHaveProperty('sameAs')
  })
})

describe('jsonLdAssociation', () => {
  it('produit un NGO avec les champs publics', () => {
    const a: Association = {
      id: 7,
      nom: 'Autisme Toulouse',
      type_association: 'Association de familles',
      ville: 'Toulouse',
      departement: '31',
      telephone: '05 11 11 11 11',
      email: 'contact@exemple.fr'
    }
    const ld = jsonLdAssociation(a)
    expect(ld['@type']).toBe('NGO')
    expect(ld.url).toBe('https://www.annuaire-tsa.fr/association/7')
    expect(ld.telephone).toBe('05 11 11 11 11')
    expect(ld.email).toBe('contact@exemple.fr')
  })
})
