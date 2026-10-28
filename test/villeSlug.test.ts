import { describe, expect, it } from 'vitest'
import { slugVille } from '../app/utils/villeSlug'

describe('slugVille', () => {
  it('normalise accents et casse', () => {
    expect(slugVille('NEUILLY-SUR-SEINE')).toBe('neuilly-sur-seine')
    expect(slugVille('Villenave d\'ornon')).toBe('villenave-d-ornon')
    expect(slugVille('Étampes')).toBe('etampes')
  })
})
