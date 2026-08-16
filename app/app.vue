<script setup lang="ts">
useHead({
  meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
  link: [{ rel: 'icon', href: '/favicon.ico' }],
  htmlAttrs: { lang: 'fr' },
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': 'Annuaire TSA',
      'url': 'https://www.annuaire-tsa.fr',
      'description': 'Annuaire collaboratif et gratuit de praticiens spécialisés dans les troubles du spectre autistique (TSA) en France.',
      'inLanguage': 'fr',
      'publisher': {
        '@type': 'Organization',
        'name': 'Annuaire TSA',
        'url': 'https://www.annuaire-tsa.fr'
      },
      'potentialAction': {
        '@type': 'SearchAction',
        'target': 'https://www.annuaire-tsa.fr/?q={search_term_string}',
        'query-input': 'required name=search_term_string'
      }
    })
  }]
})

useSeoMeta({
  title: 'Annuaire TSA — Trouvez un spécialiste près de chez vous',
  description: 'Annuaire collaboratif et gratuit de praticiens spécialisés dans les troubles du spectre autistique (TSA).',
  ogTitle: 'Annuaire TSA — Trouvez un spécialiste près de chez vous',
  ogDescription: 'Annuaire collaboratif et gratuit de psychiatres, psychologues, neuropsychologues, orthophonistes et autres praticiens spécialisés dans les troubles du spectre autistique en France.',
  ogImage: 'https://www.annuaire-tsa.fr/img/og-image.png',
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
