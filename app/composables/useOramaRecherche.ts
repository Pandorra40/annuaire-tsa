import { create, insertMultiple, search, type AnyOrama, type Results } from '@orama/orama'
import type { SuggestionRecherche } from '~/search/documents'
import {
  ORAMA_RESULT_LIMIT,
  ORAMA_TOLERANCE,
  SUGGESTION_MIN_CHARS,
  suggestionsDepuisHits
} from '~/search/documents'

type OramaSchema = Record<string, 'string' | 'number' | 'boolean'>

interface ConfigOramaRecherche<T> {
  schema: OramaSchema
  properties: readonly string[]
  items: () => T[]
  getId: (item: T) => string
  toDocument: (item: T) => Record<string, string>
  toSuggestions: (doc: Record<string, string>) => SuggestionRecherche[]
}

/**
 * Index Orama côté client, reconstruit quand la liste source change.
 * `matches(id)` indique si l'élément passe la recherche texte courante.
 */
export function useOramaRecherche<T>(term: Ref<string>, config: ConfigOramaRecherche<T>) {
  const db = shallowRef<AnyOrama | null>(null)
  const idsCorrespondants = ref<Set<string> | null>(null)
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

  function executerRecherche() {
    if (!db.value) return

    const q = term.value.trim()
    if (!q || q.length < 1) {
      idsCorrespondants.value = null
      suggestions.value = []
      return
    }

    const resultats = search(db.value, {
      term: q,
      properties: [...config.properties],
      tolerance: ORAMA_TOLERANCE,
      limit: ORAMA_RESULT_LIMIT
    }) as Results<Record<string, string>>

    const ids = new Set<string>()
    for (const hit of resultats.hits) {
      const id = hit.document.id
      if (id) ids.add(id)
    }
    idsCorrespondants.value = ids

    suggestions.value = q.length >= SUGGESTION_MIN_CHARS
      ? suggestionsDepuisHits(resultats.hits, q, config.toSuggestions)
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

  return { correspond, suggestions, pret }
}
