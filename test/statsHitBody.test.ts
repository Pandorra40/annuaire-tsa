import { describe, expect, it } from 'vitest'
import { parseStatsHitBody } from '../server/utils/statsHitBody'

describe('parseStatsHitBody', () => {
  it('accepte un objet déjà parsé (application/json)', () => {
    expect(parseStatsHitBody({ path: '/associations' })).toEqual({ path: '/associations' })
  })

  it('parse une string JSON (text/plain sendBeacon, comme PHP)', () => {
    expect(parseStatsHitBody('{"path":"/"}')).toEqual({ path: '/' })
  })

  it('retombe sur path form-urlencoded si JSON vide', () => {
    expect(parseStatsHitBody('', '/contact')).toEqual({ path: '/contact' })
  })

  it('ignore une string non JSON', () => {
    expect(parseStatsHitBody('not-json')).toEqual({})
  })
})
