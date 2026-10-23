import { describe, expect, it } from 'vitest'
import { SECURITY_HEADERS } from '../server/utils/securityHeaders'

describe('SECURITY_HEADERS', () => {
  it('expose CSP, anti-clickjacking et nosniff', () => {
    expect(SECURITY_HEADERS['Content-Security-Policy']).toContain('default-src \'self\'')
    expect(SECURITY_HEADERS['Content-Security-Policy']).toContain('frame-ancestors')
    expect(SECURITY_HEADERS['X-Frame-Options']).toBe('DENY')
    expect(SECURITY_HEADERS['X-Content-Type-Options']).toBe('nosniff')
    expect(SECURITY_HEADERS['Referrer-Policy']).toBe('strict-origin-when-cross-origin')
    expect(SECURITY_HEADERS['Permissions-Policy']).toContain('camera=()')
  })

  it('autorise les iframes YouTube nocookie pour les vidéos', () => {
    expect(SECURITY_HEADERS['Content-Security-Policy']).toContain(
      'https://www.youtube-nocookie.com'
    )
  })
})
