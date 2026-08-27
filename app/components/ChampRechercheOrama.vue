<script setup lang="ts">
import type { SuggestionRecherche } from '~/search/documents'

const model = defineModel<string>({ required: true })

const props = withDefaults(defineProps<{
  suggestions?: SuggestionRecherche[]
  placeholder?: string
  aide?: string
  ariaLabel?: string
}>(), {
  suggestions: () => []
})

const listeVisible = ref(false)
const idListe = `suggestions-${useId()}`

function onFocus() {
  if (props.suggestions.length) listeVisible.value = true
}

function onBlur() {
  // Laisse le clic sur une suggestion se terminer avant de fermer.
  setTimeout(() => { listeVisible.value = false }, 150)
}

function onInput() {
  listeVisible.value = props.suggestions.length > 0
}

function choisir(sug: SuggestionRecherche) {
  model.value = sug.value
  listeVisible.value = false
}
</script>

<template>
  <div class="relative">
    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none" aria-hidden="true">🔍</span>
    <input
      v-model="model"
      type="search"
      :aria-label="ariaLabel ?? 'Rechercher'"
      :placeholder="placeholder"
      :aria-expanded="listeVisible && suggestions.length > 0"
      :aria-controls="idListe"
      autocomplete="off"
      class="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-base outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-gray-50 text-gray-900 transition-all"
      @focus="onFocus"
      @blur="onBlur"
      @input="onInput"
    >
    <ul
      v-if="listeVisible && suggestions.length"
      :id="idListe"
      role="listbox"
      class="absolute z-20 left-0 right-0 mt-1 py-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto"
    >
      <li
        v-for="(sug, i) in suggestions"
        :key="`${sug.label}-${i}`"
        role="option"
        class="px-4 py-2.5 text-sm text-gray-800 hover:bg-indigo-50 cursor-pointer"
        @mousedown.prevent="choisir(sug)"
      >
        {{ sug.label }}
      </li>
    </ul>
    <p v-if="aide" class="text-xs text-gray-500 mt-2">{{ aide }}</p>
  </div>
</template>
