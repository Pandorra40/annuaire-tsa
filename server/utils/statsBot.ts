export function isBotUserAgent(ua: string | null | undefined): boolean {
  if (ua == null || ua === '') return true
  const lower = ua.toLowerCase()

  if (
    lower.includes('bot')
    || lower.includes('spider')
    || lower.includes('crawl')
    || lower.includes('slurp')
    || lower.includes('fetcher')
    || lower.includes('monitor')
    || lower.includes('scrapy')
    || lower.includes('headless')
    || lower.includes('phantom')
    || lower.includes('selenium')
    || lower.includes('puppeteer')
    || lower.includes('playwright')
  ) {
    return true
  }

  const known = [
    'googlebot', 'bingbot', 'yandexbot', 'baiduspider', 'duckduckbot',
    'applebot', 'facebookexternalhit', 'twitterbot', 'linkedinbot',
    'semrush', 'ahrefs', 'mj12bot', 'dotbot', 'petalbot',
    'gptbot', 'chatgpt', 'claudebot', 'anthropic', 'bytespider',
    'ccbot', 'cohere-ai', 'meta-externalagent', 'perplexity',
    'amazonbot', 'ia_archiver', 'archive.org_bot', 'uptime',
    'pingdom', 'statuscake', 'site24x7', 'curl/', 'wget/',
    'python-requests', 'go-http-client', 'java/', 'libwww',
    'httpclient', 'okhttp', 'axios/', 'node-fetch', 'undici'
  ]
  return known.some(needle => lower.includes(needle))
}

export function normalizeVisitPath(path: string): string | null {
  let p = path.trim()
  if (p === '') return null

  if (/^https?:\/\//i.test(p)) {
    try {
      p = new URL(p).pathname || '/'
    } catch {
      return null
    }
  }
  p = p.split('?')[0]!.split('#')[0]!
  if (p === '' || p[0] !== '/') {
    p = '/' + p.replace(/^\/+/, '')
  }
  p = p.replace(/\/+/g, '/')
  if (p.length > 200) p = p.slice(0, 200)

  const lower = p.toLowerCase()
  const excludedPrefixes = [
    '/admin', '/api', '/_nuxt', '/stats', '/sw.js', '/workbox',
    '/manifest', '/favicon', '/robots.txt', '/sitemap'
  ]
  for (const prefix of excludedPrefixes) {
    if (
      lower === prefix
      || lower.startsWith(prefix + '/')
      || lower.startsWith(prefix + '.')
    ) {
      return null
    }
  }
  if (/\.(js|css|map|png|jpe?g|gif|svg|webp|ico|woff2?|ttf|eot|json)$/i.test(p)) {
    return null
  }
  return p
}
