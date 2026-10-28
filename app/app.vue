<script setup lang="ts">
useHead({
  meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
  link: [
    { rel: 'icon', href: '/favicon.ico' },
    // Précharge les sous-ensembles latin (hero + recherche) : sans ça, le
    // navigateur ne découvre Figtree/Noto qu'après le CSS → swap tardif et CLS.
    // latin-ext et OpenDyslexic restent en lazy (unicode-range / mode lecture).
    { rel: 'preload', as: 'font', type: 'font/woff2', href: '/fonts/Figtree-latin.woff2', crossorigin: '' },
    { rel: 'preload', as: 'font', type: 'font/woff2', href: '/fonts/NotoSans-latin.woff2', crossorigin: '' }
  ],
  htmlAttrs: { lang: 'fr' }
})

// Defaults OG image / twitter uniquement — title/ogTitle sont posés par page
// via usePageSeo (évite l'override global qui écrasait toutes les fiches).
useSeoMeta({
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
