<script setup lang="ts">
import { GRATUIT } from '~/data/finances'

useSeoMeta({
  title: 'Remerciements — Annuaire TSA',
  description: 'L\'Annuaire TSA est gratuit grâce à des associations, des services publics, du logiciel libre — et un peu d\'hébergement payé par l\'éditeur, sans demande de don.'
})
</script>

<template>
  <div>
    <section class="relative overflow-hidden py-16" style="background: linear-gradient(160deg, #f8f4ff 0%, #f0f9ff 40%, #f0fdf4 70%, #fffbeb 100%)">
      <div class="absolute top-0 left-0 right-0 h-1" style="background: linear-gradient(90deg, #f87171, #fb923c, #fbbf24, #4ade80, #60a5fa, #a78bfa, #f472b6)" />
      <div class="absolute inset-0 pointer-events-none" style="background: radial-gradient(ellipse at 30% 50%, rgba(99,102,241,0.07) 0%, transparent 50%)" />
      <div class="relative max-w-3xl mx-auto px-6 text-center">
        <h1 class="text-4xl sm:text-5xl font-black text-gray-900 mb-3 tracking-tight">Remerciements</h1>
        <p class="text-gray-500 text-lg max-w-2xl mx-auto">
          Gratuit ne veut pas dire magique. Voici qui porte vraiment cet annuaire.
        </p>
      </div>
    </section>

    <section class="bg-gray-50 py-12">
      <div class="max-w-3xl mx-auto px-6 space-y-6">

        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
          <p class="text-gray-600 leading-relaxed">
            L'hébergement et le nom de domaine sont payés par l'éditeur,
            une cinquantaine d'euros par an, sans demande de don.
          </p>
        </div>

        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
          <div class="flex items-start gap-4 mb-5">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 text-xl">
              🎁
            </div>
            <div>
              <h2 class="font-bold text-xl text-gray-900">Merci à celles et ceux qui portent le reste</h2>
              <p class="text-gray-500 text-sm mt-1">
                Neuf briques essentielles ne coûtent rien à ce site. Elles coûtent
                quelque chose à d'autres.
              </p>
            </div>
          </div>
          <ul class="divide-y divide-gray-100">
            <li v-for="brique in GRATUIT" :key="brique.libelle" class="py-3">
              <p class="text-gray-900 font-medium text-sm">{{ brique.libelle }}</p>
              <p class="text-gray-500 text-xs mt-0.5">{{ brique.usage }}</p>
              <p class="text-emerald-700 text-xs mt-1">↳ {{ brique.finance }}</p>
            </li>
          </ul>
          <p class="text-gray-600 leading-relaxed text-sm mt-5">
            Rien de tout cela n'est tombé du ciel : ce sont des associations, des
            services publics, des entreprises et surtout beaucoup de bénévoles
            qui en portent la charge à notre place.
          </p>
          <p class="text-gray-600 leading-relaxed text-sm mt-3">
            Cet annuaire rend la pareille : son code est publié sous licence
            <a href="https://github.com/Pandorra40/annuaire-tsa" target="_blank" rel="noopener" class="text-indigo-600 hover:underline">AGPL-3.0</a>,
            ce qui permet à quiconque de le reprendre, à condition d'en faire autant
            à son tour.
          </p>
        </div>

        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0 text-xl">
              ⏳
            </div>
            <div>
              <h2 class="font-bold text-xl text-gray-900 mb-3">Et le temps</h2>
              <p class="text-gray-600 leading-relaxed">
                Vérifier chaque fiche, écrire aux praticiens, traiter les signalements :
                c'est le poste le plus lourd, et le seul qui ne figure sur aucune facture.
                Il est bénévole et le restera.
                <NuxtLink to="/apropos" class="text-indigo-600 hover:underline">À propos du projet →</NuxtLink>
              </p>
            </div>
          </div>
        </div>

        <div class="bg-indigo-50 rounded-2xl border border-indigo-100 p-6 sm:p-8">
          <h2 class="font-bold text-xl text-gray-900 mb-3">Contribuer autrement</h2>
          <p class="text-gray-700 leading-relaxed mb-4">
            Un annuaire ne vaut que par la justesse de ses informations.
            Si vous repérez une erreur ou connaissez un praticien absent, c'est ici :
          </p>
          <div class="flex flex-wrap gap-3">
            <NuxtLink to="/signaler" class="inline-flex items-center px-4 py-2 rounded-xl bg-white border border-indigo-200 text-indigo-700 font-medium text-sm hover:bg-indigo-100 transition-colors">
              Signaler une erreur
            </NuxtLink>
            <NuxtLink to="/suggerer" class="inline-flex items-center px-4 py-2 rounded-xl bg-white border border-indigo-200 text-indigo-700 font-medium text-sm hover:bg-indigo-100 transition-colors">
              Suggérer un praticien
            </NuxtLink>
          </div>
        </div>

      </div>
    </section>
  </div>
</template>
