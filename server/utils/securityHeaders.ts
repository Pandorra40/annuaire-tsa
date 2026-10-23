/**
 * En-têtes HTTP de sécurité (ex-.htaccess Apache, désormais Nitro).
 * Alignés sur public/.htaccess pour ne pas casser Nuxt / PWA / YouTube.
 */
export const SECURITY_HEADERS: Record<string, string> = {
  'Content-Security-Policy': [
    'default-src \'self\'',
    'script-src \'self\' \'unsafe-inline\' \'unsafe-eval\'',
    'style-src \'self\' \'unsafe-inline\'',
    'img-src \'self\' data:',
    'connect-src \'self\' https://www.annuaire-tsa.fr https://data.bnf.fr',
    'font-src \'self\'',
    'worker-src \'self\'',
    'frame-src https://www.youtube-nocookie.com',
    'frame-ancestors \'none\''
  ].join('; '),
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=()',
  'X-TSA-Config': '2026-10-21-nitro'
}
