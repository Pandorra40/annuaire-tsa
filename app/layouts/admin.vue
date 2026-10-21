<script setup lang="ts">
useHead({
  htmlAttrs: { 'data-color-mode-forced': 'light' },
  meta: [{ name: 'robots', content: 'noindex, nofollow' }]
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 text-gray-900">
    <a
      href="#contenu-admin"
      class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-gray-900 focus:shadow-lg focus:outline focus:outline-2 focus:outline-indigo-600"
    >
      Aller au contenu
    </a>
    <main id="contenu-admin" tabindex="-1">
      <slot />
    </main>
  </div>
</template>
