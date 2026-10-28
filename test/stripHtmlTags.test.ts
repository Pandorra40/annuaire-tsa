import { describe, expect, it } from 'vitest'
import { stripHtmlField, stripHtmlTags } from '../server/utils/stripHtml'

describe('stripHtmlTags', () => {
  it('retire les balises simples', () => {
    expect(stripHtmlTags('<b>Paris</b>')).toBe('Paris')
    expect(stripHtmlTags('a<script>x</script>b')).toBe('axb')
  })

  it('ne laisse pas passer un contournement imbriqué', () => {
    expect(stripHtmlTags('<scr<script>ipt>alert(1)</script>')).not.toMatch(/script/i)
    expect(stripHtmlTags('<scr<script>ipt>alert(1)</script>')).not.toContain('<')
  })

  it('conserve le texte autour d’un symbole < non balise', () => {
    expect(stripHtmlTags('âge < 18')).toBe('âge  18')
  })
})

describe('stripHtmlField', () => {
  it('normalise null / vide', () => {
    expect(stripHtmlField(null)).toBeNull()
    expect(stripHtmlField(undefined)).toBeNull()
    expect(stripHtmlField('   ')).toBeNull()
    expect(stripHtmlField('<i>Nice</i>')).toBe('Nice')
  })
})
