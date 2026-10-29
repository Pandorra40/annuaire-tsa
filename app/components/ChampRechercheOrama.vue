<script setup lang="ts">
import type { SuggestionRecherche } from '~/search/documents'

const model = defineModel<string>({ required: true })

const props = withDefaults(defineProps<{
  suggestions?: SuggestionRecherche[]
  placeholder?: string
  aide?: string
  /** Étiquette visible liée au champ (lecteurs d’écran + repère visuel). */
  label?: string
  ariaLabel?: string
}>(), {
  suggestions: () => []
})

const idChamp = `recherche-${useId()}`

const listeVisible = ref(false)
const indexActif = ref(-1)
const idListe = `suggestions-${useId()}`

const optionId = (i: number) => `${idListe}-opt-${i}`

watch(() => props.suggestions, () => {
  indexActif.value = -1
  if (!props.suggestions.length) listeVisible.value = false
})

function onFocus() {
  if (props.suggestions.length) listeVisible.value = true
}

function onBlur() {
  // Laisse le clic sur une suggestion se terminer avant de fermer.
  setTimeout(() => {
    listeVisible.value = false
    indexActif.value = -1
  }, 150)
}

function onInput() {
  listeVisible.value = props.suggestions.length > 0
  indexActif.value = -1
}

function choisir(sug: SuggestionRecherche) {
  model.value = sug.value
  listeVisible.value = false
  indexActif.value = -1
}

function onKeydown(e: KeyboardEvent) {
  const n = props.suggestions.length
  if (!n) return

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (!listeVisible.value) listeVisible.value = true
    indexActif.value = indexActif.value < n - 1 ? indexActif.value + 1 : 0
    return
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (!listeVisible.value) listeVisible.value = true
    indexActif.value = indexActif.value <= 0 ? n - 1 : indexActif.value - 1
    return
  }
  if (e.key === 'Enter' && listeVisible.value && indexActif.value >= 0) {
    e.preventDefault()
    const sug = props.suggestions[indexActif.value]
    if (sug) choisir(sug)
    return
  }
  if (e.key === 'Escape' && listeVisible.value) {
    e.preventDefault()
    listeVisible.value = false
    indexActif.value = -1
  }
}
</script>

<template>
  <div>
    <label
      v-if="label"
      :for="idChamp"
      class="block text-sm font-semibold text-gray-800 mb-2"
    >{{ label }}</label>
    <div class="relative">
      <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-base pointer-events-none" aria-hidden="true">🔍</span>
      <input
        :id="idChamp"
        v-model="model"
        type="search"
        role="combobox"
        :aria-label="label ? undefined : (ariaLabel ?? 'Rechercher')"
        :placeholder="placeholder"
        :aria-expanded="listeVisible && suggestions.length > 0"
        :aria-controls="listeVisible && suggestions.length ? idListe : undefined"
        :aria-activedescendant="listeVisible && indexActif >= 0 ? optionId(indexActif) : undefined"
        aria-autocomplete="list"
        autocomplete="off"
        class="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-base outline-none focus:border-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 bg-gray-50 text-gray-900 transition-all"
        @focus="onFocus"
        @blur="onBlur"
        @input="onInput"
        @keydown="onKeydown"
      >
      <ul
        v-if="listeVisible && suggestions.length"
        :id="idListe"
        role="listbox"
        class="absolute z-20 left-0 right-0 mt-1 py-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto"
      >
        <li
          v-for="(sug, i) in suggestions"
          :id="optionId(i)"
          :key="`${sug.label}-${i}`"
          role="option"
          :aria-selected="i === indexActif"
          class="px-4 py-2.5 text-sm text-gray-800 cursor-pointer"
          :class="i === indexActif ? 'bg-indigo-50' : 'hover:bg-indigo-50'"
          @mousedown.prevent="choisir(sug)"
        >
          {{ sug.label }}
        </li>
      </ul>
    </div>
    <p v-if="aide" class="text-sm text-gray-600 mt-2 leading-snug">{{ aide }}</p>
  </div>
</template>
