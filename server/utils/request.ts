import { createHash } from 'node:crypto'
import { openSync, closeSync, readSync, writeSync, ftruncateSync, fstatSync, appendFileSync, constants } from 'node:fs'
import { isIP } from 'node:net'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import type { H3Event } from 'h3'
import { getRequestIP, getHeader } from 'h3'
import { apiError } from '~~/server/utils/errors'

function isLoopback(ip: string): boolean {
  return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1'
}

/**
 * Adresse du visiteur.
 *
 * Derrière le nginx Hébernet (proxy local → Node), REMOTE_ADDR vaut 127.0.0.1 :
 * on lit alors X-Real-IP posé par nginx ($remote_addr). Les X-Forwarded-*
 * libres ne sont pas honores si le pair n'est pas loopback.
 */
export function clientIp(event: H3Event): string {
  const peer = getRequestIP(event, { xForwardedFor: false })
    || event.node.req.socket.remoteAddress
    || ''
  const peerClean = peer.startsWith('::ffff:') ? peer.slice(7) : peer

  if (isLoopback(peerClean)) {
    const real = String(getHeader(event, 'x-real-ip') || '').trim()
    if (real && isIP(real)) return real
  }

  return isIP(peerClean) ? peerClean : '0.0.0.0'
}

export function tsaLog(category: string, message: string, event?: H3Event): void {
  const ip = event ? clientIp(event) : '-'
  const uri = event?.path ?? '-'
  const line = `[${new Date().toISOString()}] [${category}] ip=${ip} uri=${uri} ${message}\n`
  try {
    appendFileSync(join(tmpdir(), 'tsa_api.log'), line)
  } catch {
    /* ignore */
  }
}

/**
 * Rate limiting fichier (même sémantique que PHP rateLimit).
 */
export async function rateLimit(
  event: H3Event,
  action: string,
  max = 10,
  fenetre = 3600
): Promise<void> {
  const file = join(
    tmpdir(),
    `tsa_rl_${createHash('md5').update(action + clientIp(event)).digest('hex')}.json`
  )
  const now = Math.floor(Date.now() / 1000)

  let fd: number
  try {
    fd = openSync(file, constants.O_RDWR | constants.O_CREAT)
  } catch {
    return
  }

  try {
    const size = fstatSync(fd).size
    let content = ''
    if (size > 0) {
      const buf = Buffer.alloc(size)
      readSync(fd, buf, 0, size, 0)
      content = buf.toString('utf8')
    }

    let data: number[] = []
    if (content) {
      try {
        const parsed = JSON.parse(content) as unknown
        data = Array.isArray(parsed) ? (parsed as number[]) : []
      } catch {
        data = []
      }
    }
    data = data.filter(t => now - t < fenetre)

    if (data.length >= max) {
      tsaLog('rate_limit', `action=${action} max=${max} window=${fenetre}s`, event)
      apiError(429, 'Trop de requêtes. Réessayez plus tard.')
    }

    data.push(now)
    const out = JSON.stringify(data)
    ftruncateSync(fd, 0)
    writeSync(fd, out, 0)
  } finally {
    closeSync(fd)
  }
}
