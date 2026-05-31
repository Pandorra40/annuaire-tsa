<script setup lang="ts">
import type { Association } from '~/types/index'

const route = useRoute()
const id = Number(route.params.id)
const { fetchAssociation } = useApi()

const { data, status } = await useAsyncData(`association-${id}`, () => fetchAssociation(id), { server: false })

const association = computed<Association | null>(() => data.value?.[0] ?? null)

useSeoMeta({
  title: computed(() => association.value ? `${association.value.nom} — Associations TSA` : 'Association TSA'),
  description: computed(() => association.value ? `${association.value.nom} — Association TSA à ${association.value.ville} (${association.value.departement})` : '')
})

function initiales(nom: string) {
  const words = nom.trim().split(' ').filter(w => w.length > 2)
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase()
  return nom.substring(0, 2).toUpperCase()
}
</script>

<template>
  <div>

    <!-- CHARGEMENT -->
    <section v-if="status === 'pending'" class="bg-gray-50 min-h-screen flex justify-center items-center py-16">
      <svg class="animate-spin text-gray-400 w-10 h-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
      </svg>
    </section>

    <!-- ERREUR -->
    <section v-else-if="status === 'error' || !association" class="bg-gray-50 min-h-screen py-16">
      <div class="max-w-3xl mx-auto px-6">
        <NuxtLink to="/associations" class="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm mb-6 transition-colors font-medium">
          ← Retour aux associations
        </NuxtLink>
        <div class="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700">
          Association introuvable.
        </div>
      </div>
    </section>

    <template v-else>

      <!-- EN-TÊTE -->
      <section class="relative overflow-hidden py-14" style="background: linear-gradient(160deg, #f0fdf4 0%, #f0f9ff 40%, #fdf4ff 70%, #fffbeb 100%)">
        <div class="absolute top-0 left-0 right-0 h-1" style="background: linear-gradient(90deg, #f87171, #fb923c, #fbbf24, #4ade80, #60a5fa, #a78bfa, #f472b6)" />
        <div class="relative max-w-4xl mx-auto px-6">
          <NuxtLink to="/associations" class="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm mb-8 transition-colors font-medium">
            ← Retour aux associations
          </NuxtLink>

          <div class="flex items-start gap-6">
            <div class="w-20 h-20 rounded-2xl flex items-center justify-center font-black text-white text-2xl shrink-0 shadow-lg" style="background: linear-gradient(135deg, #10b981, #059669)">
              {{ initiales(association.nom) }}
            </div>
            <div class="flex-1">
              <h1 class="text-3xl font-black text-gray-900 mb-2">{{ association.nom }}</h1>
              <p class="text-gray-600 text-lg mb-3">
                <span v-if="association.ville">{{ association.ville }} · </span>
                <span v-if="association.type_association">{{ association.type_association }}</span>
                <span v-if="association.departement" class="ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-sm font-bold rounded-lg">{{ association.departement }}</span>
              </p>
              <div v-if="association.services" class="flex flex-wrap gap-1.5">
                <span
                  v-for="service in association.services.split(',')"
                  :key="service"
                  class="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full border border-blue-200"
                >{{ service.trim() }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CONTENU -->
      <section class="bg-gray-50 py-10">
        <div class="max-w-4xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-5">

          <!-- COLONNE PRINCIPALE -->
          <div class="sm:col-span-2 space-y-5">

            <!-- Description -->
            <div v-if="association.description" class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 class="font-bold text-gray-900 text-lg mb-4 flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-base">📄</div>
                Présentation
              </h2>
              <p class="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{{ association.description }}</p>
            </div>

            <!-- Public -->
            <div v-if="association.age_public" class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 class="font-bold text-gray-900 text-lg mb-4 flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-base">👥</div>
                Public concerné
              </h2>
              <p class="text-gray-600 text-sm">{{ association.age_public }}</p>
            </div>

          </div>

          <!-- COLONNE LATÉRALE -->
          <div class="space-y-5">

            <!-- Contact -->
            <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 class="font-bold text-gray-900 mb-4 flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-base">📞</div>
                Contact
              </h2>
              <a v-if="association.telephone" :href="`tel:${association.telephone}`" class="flex items-center gap-3 text-indigo-600 font-semibold hover:text-indigo-700 transition-colors mb-3">
                <div class="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 text-sm">📞</div>
                {{ association.telephone }}
              </a>
              <a v-if="association.email" :href="`mailto:${association.email}`" class="flex items-center gap-3 text-gray-600 hover:text-gray-900 transition-colors mb-3 min-w-0">
                <div class="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 text-sm">✉️</div>
                <span class="truncate text-sm">{{ association.email }}</span>
              </a>
              <a v-if="association.site_web" :href="association.site_web" target="_blank" rel="noopener" class="flex items-center gap-3 text-indigo-600 hover:text-indigo-700 transition-colors text-sm">
                <div class="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 text-sm">🔗</div>
                Site web
              </a>
              <p v-if="!association.telephone && !association.email && !association.site_web" class="text-sm text-gray-400">
                Aucun contact renseigné
              </p>
            </div>

            <!-- Localisation -->
            <div v-if="association.adresse || association.ville" class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 class="font-bold text-gray-900 mb-4 flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-base">📍</div>
                Localisation
              </h2>
              <p class="text-gray-600 text-sm">
                {{ [association.adresse, association.ville, association.departement ? `(${association.departement})` : ''].filter(Boolean).join(', ') }}
              </p>
            </div>

          </div>
        </div>
      </section>

    </template>
  </div>
</template>
