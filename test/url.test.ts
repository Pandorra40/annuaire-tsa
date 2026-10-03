import { describe, expect, it } from 'vitest'
import { normaliserUrl } from '../app/utils/url'

describe('normaliserUrl', () => {
  it('laisse une URL https intacte', () => {
    expect(normaliserUrl('https://example.com')).toBe('https://example.com')
  })

  it('préfixe https:// sans schéma', () => {
    expect(normaliserUrl('www.doctolib.fr/pro/dupont')).toBe('https://www.doctolib.fr/pro/dupont')
    expect(normaliserUrl('example.com')).toBe('https://example.com')
  })

  it('réécrit //hôte en https://hôte', () => {
    expect(normaliserUrl('//example.com/path')).toBe('https://example.com/path')
  })

  it('renvoie vide pour une saisie vide', () => {
    expect(normaliserUrl('')).toBe('')
    expect(normaliserUrl('   ')).toBe('')
    expect(normaliserUrl(null)).toBe('')
    expect(normaliserUrl(undefined)).toBe('')
  })
})
