import { createHash, randomBytes } from 'node:crypto'

/** Jeton opaque envoyé dans le cookie HttpOnly. */
export function createSessionToken(): string {
  return randomBytes(32).toString('hex')
}

/**
 * Empreinte stockée en base. Le cookie garde le jeton brut :
 * un dump SQL ne permet plus de rejouer la session.
 */
export function hashSessionToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex')
}
