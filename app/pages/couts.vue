<script setup lang="ts">
import {
  ANNEE,
  FRAIS_RECURRENTS,
  FRAIS_FABRICATION,
  GRATUIT,
  TOTAL_PAYE,
  TOTAL_RENOUVELLEMENT,
  TOTAL_FABRICATION,
  TOTAL_ENGAGE
} from '~/data/finances'

useSeoMeta({
  title: 'Ce que coûte ce site — Annuaire TSA',
  description: 'Gratuit ne veut pas dire sans frais. Le détail de ce que coûte l\'Annuaire TSA, de ce qui est gratuit, et de qui le paie réellement.'
})

const euro = (montant: number) =>
  montant.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
</script>

<template>
  <div>
    <!-- EN-TÊTE -->
    <section class="relative overflow-hidden py-16" style="background: linear-gradient(160deg, #f8f4ff 0%, #f0f9ff 40%, #f0fdf4 70%, #fffbeb 100%)">
      <div class="absolute top-0 left-0 right-0 h-1" style="background: linear-gradient(90deg, #f87171, #fb923c, #fbbf24, #4ade80, #60a5fa, #a78bfa, #f472b6)" />
      <div class="absolute inset-0 pointer-events-none" style="background: radial-gradient(ellipse at 30% 50%, rgba(99,102,241,0.07) 0%, transparent 50%)" />
      <div class="relative max-w-3xl mx-auto px-6 text-center">
        <h1 class="text-4xl sm:text-5xl font-black text-gray-900 mb-3 tracking-tight">Ce que coûte ce site</h1>
        <p class="text-gray-500 text-lg max-w-2xl mx-auto">
          Gratuit et open source ne veut pas dire sans frais. Voici les chiffres, sans rien vous demander.
        </p>
      </div>
    </section>

    <section class="bg-gray-50 py-12">
      <div class="max-w-3xl mx-auto px-6 space-y-6">

        <!-- LE CHIFFRE -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <p class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Coût de fonctionnement</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p class="flex items-baseline gap-2 flex-wrap">
                <span class="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight tabular-nums">{{ euro(TOTAL_PAYE) }}</span>
                <span class="text-gray-500 font-medium">payés en {{ ANNEE }}</span>
              </p>
              <p class="text-sm text-gray-500 mt-1">Avec une remise de bienvenue de 63 %.</p>
            </div>
            <div class="sm:border-l sm:border-gray-100 sm:pl-6">
              <p class="flex items-baseline gap-2 flex-wrap">
                <span class="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight tabular-nums">{{ euro(TOTAL_RENOUVELLEMENT) }}</span>
                <span class="text-gray-500 font-medium">dès {{ ANNEE + 1 }}</span>
              </p>
              <p class="text-sm text-gray-500 mt-1">Le prix réel, une fois la promotion terminée.</p>
            </div>
          </div>
          <p class="text-gray-600 leading-relaxed mt-6">
            Le premier chiffre est un prix d'appel, le second est le vrai. Les afficher tous les
            deux évite de laisser croire qu'héberger un site coûte une vingtaine d'euros par an.
            Cette somme est payée par l'éditeur du site. Cette page est là pour informer :
            elle ne demande rien.
          </p>
        </div>

        <!-- FRAIS RÉCURRENTS -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
          <div class="flex items-start gap-4 mb-5">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 text-xl">
              🔁
            </div>
            <div>
              <h2 class="font-bold text-xl text-gray-900">Chaque année</h2>
              <p class="text-gray-500 text-sm mt-1">Les deux seules dépenses obligatoires.</p>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm min-w-[28rem]">
              <thead>
                <tr class="text-xs text-gray-500 uppercase tracking-wider">
                  <th class="text-left font-semibold pb-2">Dépense</th>
                  <th class="text-right font-semibold pb-2 px-3 whitespace-nowrap">Payé en {{ ANNEE }}</th>
                  <th class="text-right font-semibold pb-2 whitespace-nowrap">Dès {{ ANNEE + 1 }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="frais in FRAIS_RECURRENTS" :key="frais.libelle" class="border-t border-gray-100">
                  <td class="py-3 pr-4">
                    <span class="text-gray-900 font-medium">{{ frais.libelle }}</span>
                    <span class="block text-gray-500 text-xs mt-0.5">{{ frais.detail }}</span>
                  </td>
                  <td class="py-3 px-3 text-right text-gray-500 tabular-nums whitespace-nowrap align-top">{{ euro(frais.paye) }}</td>
                  <td class="py-3 text-right text-gray-900 font-semibold tabular-nums whitespace-nowrap align-top">{{ euro(frais.renouvellement) }}</td>
                </tr>
                <tr class="border-t-2 border-gray-200">
                  <td class="py-3 pr-4 text-gray-900 font-semibold">Total</td>
                  <td class="py-3 px-3 text-right text-gray-500 tabular-nums whitespace-nowrap">{{ euro(TOTAL_PAYE) }}</td>
                  <td class="py-3 text-right text-gray-900 font-bold tabular-nums whitespace-nowrap">{{ euro(TOTAL_RENOUVELLEMENT) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- FRAIS DE FABRICATION -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
          <div class="flex items-start gap-4 mb-5">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center shrink-0 text-xl">
              🔨
            </div>
            <div>
              <h2 class="font-bold text-xl text-gray-900">Une seule fois, pour le construire</h2>
              <p class="text-gray-500 text-sm mt-1">Engagé en {{ ANNEE }}, ne se répète pas.</p>
            </div>
          </div>
          <table class="w-full text-sm">
            <tbody>
              <tr v-for="frais in FRAIS_FABRICATION" :key="frais.libelle" class="border-t border-gray-100">
                <td class="py-3 pr-4">
                  <span class="text-gray-900 font-medium">{{ frais.libelle }}</span>
                  <span class="block text-gray-500 text-xs mt-0.5">{{ frais.detail }}</span>
                </td>
                <td class="py-3 text-right text-gray-900 font-semibold tabular-nums whitespace-nowrap align-top">{{ euro(frais.montant) }}</td>
              </tr>
            </tbody>
          </table>
          <p class="text-gray-600 leading-relaxed text-sm mt-5">
            Cette dépense est mise à part volontairement : l'ajouter au coût annuel donnerait un
            chiffre faux, puisqu'elle ne reviendra pas. Elle mérite pourtant d'être dite, car sans
            elle le site n'existerait pas.
          </p>
          <p class="text-gray-600 leading-relaxed text-sm mt-3">
            Fabrication et fonctionnement additionnés, l'année {{ ANNEE }} aura donc coûté
            <strong class="tabular-nums">{{ euro(TOTAL_ENGAGE) }}</strong>.
          </p>
        </div>

        <!-- GRATUIT -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
          <div class="flex items-start gap-4 mb-5">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 text-xl">
              🎁
            </div>
            <div>
              <h2 class="font-bold text-xl text-gray-900">Gratuit — mais payé par quelqu'un</h2>
              <p class="text-gray-500 text-sm mt-1">
                Neuf briques essentielles ne coûtent rien à ce site. Elles coûtent quelque chose
                à d'autres.
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
            C'est là que se cache le vrai coût d'un site « gratuit ». Rien de tout cela n'est
            tombé du ciel : ce sont des associations, des services publics, des entreprises et
            surtout beaucoup de bénévoles qui en portent la charge à notre place.
          </p>
          <p class="text-gray-600 leading-relaxed text-sm mt-3">
            Cet annuaire rend la pareille : son code est publié sous licence
            <a href="https://github.com/Pandorra40/annuaire-tsa" target="_blank" rel="noopener" class="text-indigo-600 hover:underline">AGPL-3.0</a>,
            ce qui permet à quiconque de le reprendre pour recenser d'autres praticiens ou
            d'autres besoins mal couverts, à condition d'en faire autant à son tour.
          </p>
        </div>

        <!-- LE TEMPS -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0 text-xl">
              ⏳
            </div>
            <div>
              <h2 class="font-bold text-xl text-gray-900 mb-3">Et le temps</h2>
              <p class="text-gray-600 leading-relaxed">
                Vérifier chaque fiche avant publication, écrire aux praticiens un par un, traiter
                les signalements, corriger les erreurs : c'est le poste le plus lourd, et le seul
                qui ne figure sur aucune facture. Il est bénévole et le restera.
                <NuxtLink to="/apropos" class="text-indigo-600 hover:underline">À propos du projet →</NuxtLink>
              </p>
            </div>
          </div>
        </div>

        <!-- AIDER -->
        <div class="bg-indigo-50 rounded-2xl border border-indigo-100 p-6 sm:p-8">
          <h2 class="font-bold text-xl text-gray-900 mb-3">Contribuer autrement</h2>
          <p class="text-gray-700 leading-relaxed mb-4">
            Un annuaire ne vaut que par la justesse de ses informations, et personne ne peut
            vérifier seul plus de trois cents fiches. Si vous repérez une erreur ou connaissez
            un praticien absent, c'est ici :
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
