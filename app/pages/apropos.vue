<script setup lang="ts">
useSeoMeta({
  title: 'À propos — Annuaire TSA',
  description: 'Présentation de l\'Annuaire TSA, projet collaboratif et gratuit de praticiens spécialisés dans les troubles du spectre autistique.'
})

const faq = [
  {
    label: 'Qu\'est-ce que l\'Annuaire TSA ?',
    content: 'L\'Annuaire TSA est une ressource complète et gratuite pour les familles concernées par les troubles du spectre autistique. Il comprend un annuaire de praticiens spécialisés (psychiatres, psychologues, neuropsychologues, orthophonistes, ergothérapeutes, psychomotriciens), un annuaire de 290 associations TSA en France, et une sélection de livres sur le TSA. Chaque fiche praticien est vérifiée manuellement avant publication.'
  },
  {
    label: 'Qui est derrière ce projet ?',
    content: 'Ce projet est une initiative bénévole et personnelle, sans association formelle, sans financement commercial et sans publicité. Il est développé et maintenu par Pandorra40, à titre entièrement bénévole. Le code source est publié sous licence libre (AGPL-3.0) et disponible sur GitHub. Pour être transparent, ce projet a été entièrement vibecoder avec Claude Code (IA d\'Anthropic) — la vision, les choix fonctionnels et les orientations sont humains, le code a été généré par l\'IA.'
  },
  {
    label: 'Comment les fiches sont-elles vérifiées ?',
    content: 'Toute suggestion soumise par la communauté est examinée manuellement avant publication. L\'administrateur vérifie l\'existence du praticien via le répertoire RPPS officiel. Une fois publiée, la communauté peut confirmer l\'exactitude d\'une fiche ou signaler une erreur.'
  },
  {
    label: 'D\'où proviennent les données des praticiens ?',
    content: 'L\'annuaire agrège des informations issues de plusieurs ressources publiques dédiées à l\'autisme, principalement Autisme Info Service (annuaire.autismeinfoservice.fr) et Tamis-Autisme (tamis-autisme.org), enrichies et complétées manuellement. Les données sont fournies à titre indicatif ; en cas de doute, contactez directement le praticien.'
  },
  {
    label: 'Puis-je faire confiance aux informations ?',
    content: 'Les informations sont fournies à titre indicatif et peuvent évoluer. Un système d\'alerte interne signale automatiquement les fiches ayant reçu plusieurs signalements. En cas de doute, pensez toujours à contacter directement le praticien avant de vous déplacer.'
  },
  {
    label: 'Le projet est-il vraiment gratuit et sans publicité ?',
    content: 'Oui, totalement. L\'Annuaire TSA ne diffuse aucune publicité, ne vend aucune donnée, et ne propose aucun abonnement payant. L\'accès est libre et gratuit pour tous, sans inscription requise.'
  },
  {
    label: 'Puis-je réutiliser ou adapter ce projet ?',
    content: 'Oui. Le code source est publié sous licence AGPL-3.0 sur GitHub. Vous pouvez librement le télécharger, le modifier et l\'adapter — à condition de publier vos modifications sous la même licence.'
  }
]
</script>

<template>
  <div>
    <!-- EN-TÊTE -->
    <section class="relative overflow-hidden py-16" style="background: linear-gradient(160deg, #f8f4ff 0%, #f0f9ff 40%, #f0fdf4 70%, #fffbeb 100%)">
      <div class="absolute top-0 left-0 right-0 h-1" style="background: linear-gradient(90deg, #f87171, #fb923c, #fbbf24, #4ade80, #60a5fa, #a78bfa, #f472b6)" />
      <div class="absolute inset-0 pointer-events-none" style="background: radial-gradient(ellipse at 30% 50%, rgba(99,102,241,0.07) 0%, transparent 50%)" />
      <div class="relative max-w-3xl mx-auto px-6 text-center">
        <h1 class="text-4xl sm:text-5xl font-black text-gray-900 mb-3 tracking-tight">À propos</h1>
        <p class="text-gray-500 text-lg max-w-2xl mx-auto">Tout ce que vous devez savoir sur le projet Annuaire TSA.</p>
      </div>
    </section>

    <section class="bg-gray-50 py-12">
      <div class="max-w-3xl mx-auto px-6 space-y-6">

        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 text-xl">
              ❤️
            </div>
            <div>
              <h2 class="font-bold text-xl text-gray-900 mb-3">Un projet né d'un besoin réel</h2>
              <p class="text-gray-600 leading-relaxed">
                Trouver un professionnel de santé spécialisé dans les troubles du spectre autistique (TSA) en France reste un parcours du combattant pour de nombreuses familles.
                L'Annuaire TSA est né de ce constat : centraliser, vérifier et rendre accessibles les informations sur les praticiens spécialisés TSA, gratuitement, sans publicité, et avec l'aide de la communauté.
                C'est un projet <strong>construit par les familles, pour les familles</strong>.
              </p>
              <p class="text-gray-600 leading-relaxed mt-3">
                Au-delà de l'annuaire de praticiens, le site propose également un <strong>annuaire de 290 associations TSA</strong> en France — parce qu'une fois le diagnostic posé, les familles ont besoin de soutien, d'entraide et d'accompagnement. Une <strong>sélection de livres</strong> sur le TSA complète ces ressources.
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div class="p-6 pb-4 border-b border-gray-100">
            <h2 class="font-bold text-lg text-gray-900 flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-base">❓</div>
              Questions fréquentes
            </h2>
          </div>
          <div class="p-2">
            <UAccordion :items="faq" />
          </div>
        </div>

      </div>
    </section>
  </div>
</template>
