<script setup lang="ts">
usePageSeo({
  title: 'Contact — Annuaire TSA',
  description: 'Écrire à l\'Annuaire TSA : question sur le projet, signalement d\'une erreur ou suggestion concernant les praticiens et associations spécialisés dans l\'autisme référencés sur le site.',
  path: '/contact'
})

const falcMode = useFalcMode()
</script>

<template>
  <div>
    <section class="relative overflow-hidden py-16" style="background: linear-gradient(160deg, #f8f4ff 0%, #f0f9ff 40%, #f0fdf4 70%, #fffbeb 100%)">
      <div class="absolute top-0 left-0 right-0 h-1" style="background: linear-gradient(90deg, #f87171, #fb923c, #fbbf24, #4ade80, #60a5fa, #a78bfa, #f472b6)" />
      <div class="relative max-w-3xl mx-auto px-6 text-center">
        <h1 class="text-4xl sm:text-5xl font-black text-gray-900 mb-3 tracking-tight">Contact</h1>
        <p v-if="!falcMode" class="text-gray-500 text-lg">Une question, un signalement, une suggestion ? Écrivez-moi.</p>
        <p v-else class="text-gray-500 text-lg">Vous voulez m’écrire ? Voici comment.</p>
      </div>
    </section>

    <section class="bg-gray-50 py-12 min-h-screen">
      <div class="max-w-2xl mx-auto px-6 space-y-5">

        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
          <div class="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center text-2xl" style="background: linear-gradient(135deg, #6366f1, #8b5cf6)">
            ✉️
          </div>
          <template v-if="!falcMode">
            <h2 class="text-xl font-bold text-gray-900 mb-3">M'écrire</h2>
            <p class="text-gray-600 text-sm leading-relaxed mb-6 max-w-md mx-auto">
              Pour toute question sur le projet, signalement d'une erreur ou proposition de contribution.
              <span class="block mt-2">Vous écrivez à une seule personne, bénévole.</span>
            </p>
          </template>
          <template v-else>
            <h2 class="text-xl font-bold text-gray-900 mb-3">M’écrire</h2>
            <div class="text-gray-600 text-sm leading-relaxed mb-6 max-w-md mx-auto space-y-2 text-left sm:text-center">
              <p>Vous pouvez m’écrire pour :</p>
              <p>• une question sur le site</p>
              <p>• signaler une erreur</p>
              <p>• proposer une idée</p>
              <p class="mt-2">Vous écrivez à une seule personne.</p>
              <p>Elle s’occupe du site bénévolement.</p>
            </div>
          </template>
          <a href="mailto:annuaire.tsa@gmail.com" class="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-700 transition-colors">
            ✉️ annuaire.tsa@gmail.com
          </a>
        </div>

        <CadreBenevole />

        <div class="bg-amber-50 border border-amber-100 rounded-2xl p-5 text-center">
          <p v-if="!falcMode" class="text-sm text-amber-900 leading-relaxed">
            🌟 Ce projet est <strong>open source</strong>. Le code est disponible sur
            <a href="https://github.com/Pandorra40/annuaire-tsa" target="_blank" rel="noopener" class="underline hover:text-amber-700">GitHub</a>.
            Les contributions sont les bienvenues !
          </p>
          <div v-else class="text-sm text-amber-900 leading-relaxed space-y-2">
            <p>Le code du site est public.</p>
            <p>
              Vous pouvez le voir sur
              <a href="https://github.com/Pandorra40/annuaire-tsa" target="_blank" rel="noopener" class="underline hover:text-amber-700">GitHub</a>.
            </p>
            <p>Vous pouvez aussi proposer des améliorations.</p>
          </div>
        </div>

      </div>
    </section>
  </div>
</template>
