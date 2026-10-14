import { getQuery, setResponseHeader, setResponseStatus } from 'h3'
import { readFileSync, unlinkSync, writeFileSync, existsSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { requireAdmin } from '~~/server/utils/auth'
import { rateLimit } from '~~/server/utils/request'

const cacheFile = join(tmpdir(), 'bnf_livres_cache.json')
const cacheTTL = 86400

const MOTS_ANGLAIS =
  /\b(the|and|disorder|developmental|trajectories|children|politics|handbook|spectrum disorders|understanding|with|from|toward|guide to)\b/i
const MOTS_PSYCHANALYSE = /\b(psychanaly|lacan|freud|dolto|bettelheim|inconscient|signifiant)/i

function emitJson(event: Parameters<typeof setResponseStatus>[0], body: string, code = 200, publicCache = false) {
  setResponseStatus(event, code)
  setResponseHeader(event, 'Content-Type', 'application/json; charset=utf-8')
  if (publicCache) {
    setResponseHeader(event, 'Cache-Control', 'public, max-age=3600')
  } else {
    setResponseHeader(event, 'Cache-Control', 'no-store, no-cache, must-revalidate')
    setResponseHeader(event, 'Pragma', 'no-cache')
  }
  return JSON.parse(body)
}

export default defineEventHandler(async (event) => {
  const forceRefresh = getQuery(event).refresh != null
  if (forceRefresh) {
    await requireAdmin(event)
    if (existsSync(cacheFile)) {
      try {
        unlinkSync(cacheFile)
      } catch {
        /* ignore */
      }
    }
  }

  if (
    !forceRefresh &&
    existsSync(cacheFile) &&
    Date.now() - statSync(cacheFile).mtimeMs < cacheTTL * 1000
  ) {
    return emitJson(event, readFileSync(cacheFile, 'utf8'), 200, true)
  }

  await rateLimit(event, 'bnf_upstream', 12, 3600)

  const anneeMin = new Date().getFullYear() - 3
  const sparql = `PREFIX dcterms: <http://purl.org/dc/terms/>
PREFIX bnf-onto: <http://data.bnf.fr/ontology/bnf-onto/>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
SELECT DISTINCT ?w ?titre ?annee ?ean WHERE {
  ?w dcterms:subject ?s . ?s skos:prefLabel ?l .
  FILTER(CONTAINS(LCASE(STR(?l)), "autisme"))
  ?w dcterms:title ?titre .
  ?w bnf-onto:firstYear ?annee .
  FILTER(?annee >= ${anneeMin})
  OPTIONAL { ?w bnf-onto:ean ?ean . }
} ORDER BY DESC(?annee) LIMIT 60`

  const url = `https://data.bnf.fr/sparql?format=json&query=${encodeURIComponent(sparql)}`

  let raw: string
  try {
    raw = await $fetch<string>(url, {
      timeout: 45_000,
      headers: { 'User-Agent': 'annuaire-tsa.fr/1.0' },
      responseType: 'text'
    })
  } catch {
    if (existsSync(cacheFile)) {
      return emitJson(event, readFileSync(cacheFile, 'utf8'), 200, true)
    }
    setResponseStatus(event, 502)
    return { error: 'Impossible de contacter data.bnf.fr' }
  }

  let data: { results?: { bindings?: Array<Record<string, { value?: string }>> } }
  try {
    data = JSON.parse(raw)
  } catch {
    if (existsSync(cacheFile)) {
      return emitJson(event, readFileSync(cacheFile, 'utf8'), 200, true)
    }
    setResponseStatus(event, 502)
    return { error: 'Réponse data.bnf.fr invalide' }
  }

  const bindings = data.results?.bindings
  if (!bindings) {
    if (existsSync(cacheFile)) {
      return emitJson(event, readFileSync(cacheFile, 'utf8'), 200, true)
    }
    setResponseStatus(event, 502)
    return { error: 'Réponse data.bnf.fr invalide' }
  }

  const vus = new Set<string>()
  const docs: Array<Record<string, unknown>> = []

  for (const b of bindings) {
    const titre = String(b.titre?.value ?? '').trim()
    if (titre === '') continue

    const cle = titre.toLowerCase()
    if (vus.has(cle)) continue
    vus.add(cle)

    if (MOTS_ANGLAIS.test(titre)) continue
    if (MOTS_PSYCHANALYSE.test(titre)) continue

    const annee = b.annee?.value != null ? Number(b.annee.value) : null
    let lien = String(b.w?.value ?? '').replace(/#about$/, '')
    lien = lien.replace(/^https?:\/\/data\.bnf\.fr\//, 'https://catalogue.bnf.fr/')

    docs.push({
      title: titre,
      author_name: [],
      first_publish_year: annee,
      language: ['fre'],
      subject: ['Autisme'],
      key: lien
    })

    if (docs.length >= 12) break
  }

  const out = JSON.stringify({ docs })
  if (docs.length) {
    writeFileSync(cacheFile, out, 'utf8')
  }

  return emitJson(event, out, 200, true)
})
