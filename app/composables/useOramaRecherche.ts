import { create, insertMultiple, search, type AnyOrama, type Results } from '@orama/orama'
import type { SuggestionRecherche } from '~/search/documents'
import {
  ORAMA_RESULT_LIMIT,
  ORAMA_TOLERANCE,
  SUGGESTION_MIN_CHARS,
  suggestionsDepuisHits
} from '~/search/documents'
import { normaliserRecherche } from '~/utils/recherche'

type OramaSchema = Record<string, 'string' | 'number' | 'boolean'>

interface ConfigOramaRecherche<T> {
  schema: OramaSchema
  properties: readonly string[]
  items: () => T[]
  getId: (item: T) => string
  toDocument: (item: T) => Record<string, string>
  toSuggestions: (doc: Record<string, string>) => SuggestionRecherche[]
}

/** Mots outils FR : exclus de l’intersection ET (gardés s’ils sont seuls). */
const MOTS_VIDES = new Set([
  'de', 'du', 'des', 'le', 'la', 'les', 'un', 'une', 'et', 'en', 'a', 'au', 'aux',
  'sur', 'pour', 'par', 'dans', 'avec', 'chez'
])

/**
 * Découpe une requête en jetons significatifs.
 * « orthophoniste Lyon » → deux jetons → intersection (ET), pas un OU Orama.
 */
export function jetonsRecherche(terme: string): string[] {
  const bruts = terme
    .trim()
    .split(/[\s,;|/]+/)
    .map(t => t.trim())
    .filter(Boolean)

  const utiles = bruts.filter((t) => {
    if (/^\d/.test(t)) return true
    const n = normaliserRecherche(t)
    if (n.length < 2) return false
    return !MOTS_VIDES.has(n)
  })

  // Si tout était mot vide (« de la »), on retombe sur les bruts non vides.
  return (utiles.length ? utiles : bruts.filter(t => t.length >= 1))
}

/**
 * Index Orama côté client, reconstruit quand la liste source change.
 * Multi-mots = ET (intersection) + score cumulé pour trier par pertinence.
 */
export function useOramaRecherche<T>(term: Ref<string>, config: ConfigOramaRecherche<T>) {
  const db = shallowRef<AnyOrama | null>(null)
  const idsCorrespondants = ref<Set<string> | null>(null)
  const scoresParId = ref<Map<string, number>>(new Map())
  const suggestions = ref<SuggestionRecherche[]>([])
  const pret = ref(false)

  async function reconstruireIndex() {
    const items = config.items()
    const database = create({
      schema: config.schema,
      language: 'french'
    })
    if (items.length) {
      await insertMultiple(database, items.map(config.toDocument))
    }
    db.value = database
    pret.value = true
    executerRecherche()
  }

  function chercherJeton(jeton: string) {
    return search(db.value!, {
      term: jeton,
      properties: [...config.properties],
      tolerance: ORAMA_TOLERANCE,
      limit: ORAMA_RESULT_LIMIT
    }) as Results<Record<string, string>>
  }

  function executerRecherche() {
    if (!db.value) return

    const q = term.value.trim()
    if (!q || q.length < 1) {
      idsCorrespondants.value = null
      scoresParId.value = new Map()
      suggestions.value = []
      return
    }

    const jetons = jetonsRecherche(q)
    const scores = new Map<string, number>()
    let intersection: Set<string> | null = null
    let derniersHits: Results<Record<string, string>>['hits'] = []

    for (const jeton of jetons) {
      const resultats = chercherJeton(jeton)
      derniersHits = resultats.hits
      const idsJeton = new Set<string>()
      for (const hit of resultats.hits) {
        const id = hit.document.id
        if (!id) continue
        idsJeton.add(id)
        scores.set(id, (scores.get(id) ?? 0) + (hit.score ?? 0))
      }
      intersection = intersection === null
        ? idsJeton
        : new Set([...intersection].filter(id => idsJeton.has(id)))
    }

    idsCorrespondants.value = intersection ?? new Set()
    // Ne conserve les scores que pour les ids qui passent le ET.
    const scoresFiltres = new Map<string, number>()
    for (const id of idsCorrespondants.value) {
      scoresFiltres.set(id, scores.get(id) ?? 0)
    }
    scoresParId.value = scoresFiltres

    // Suggestions : sur la requête complète si un seul jeton, sinon sur le dernier
    // (souvent la ville) — mieux que des suggestions « OU » trompeuses.
    const sugSource = jetons.length === 1
      ? derniersHits
      : chercherJeton(jetons[jetons.length - 1]!).hits
    suggestions.value = q.length >= SUGGESTION_MIN_CHARS
      ? suggestionsDepuisHits(sugSource, q, config.toSuggestions)
      : []
  }

  watch(() => config.items(), () => {
    pret.value = false
    void reconstruireIndex()
  }, { deep: true, immediate: true })

  watch(term, () => {
    if (pret.value) executerRecherche()
  })

  function correspond(item: T) {
    if (idsCorrespondants.value === null) return true
    return idsCorrespondants.value.has(config.getId(item))
  }

  function scoreDe(item: T) {
    return scoresParId.value.get(config.getId(item)) ?? 0
  }

  return { correspond, scoreDe, suggestions, pret }
}
