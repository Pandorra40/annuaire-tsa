import { describe, expect, it } from 'vitest'
import { normaliserRetoursLigne, preparerTexteFiche } from '../app/utils/texteFiche'

describe('preparerTexteFiche', () => {
  const experience
    = 'Psychologue et analyste du comportement spécialisée en ABA, exerçant depuis 2008, '
      + 'spécialisée dans l\'accompagnement des personnes. Son approche s\'appuie sur '
      + 'les principes de l\'analyse appliquée du comportement (ABA).'

  it('ne casse pas le français déjà correct (fiche 130)', () => {
    expect(preparerTexteFiche(experience)).toBe(experience)
    expect(preparerTexteFiche(experience)).not.toContain('c\'omportement')
    expect(preparerTexteFiche(experience)).not.toContain('d\'epuis')
    expect(preparerTexteFiche(experience)).not.toContain('S\'on')
    expect(preparerTexteFiche(experience)).toContain('comportement')
    expect(preparerTexteFiche(experience)).toContain('l\'accompagnement')
    expect(preparerTexteFiche(experience)).toContain('s\'appuie')
  })

  it('normalise les retours à la ligne littéraux et <br>', () => {
    expect(normaliserRetoursLigne('a\\nb')).toBe('a\nb')
    expect(normaliserRetoursLigne('a<br>b')).toBe('a\nb')
    expect(preparerTexteFiche('ligne1\\nligne2')).toBe('ligne1\nligne2')
  })
})
