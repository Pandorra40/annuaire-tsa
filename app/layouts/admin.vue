<script setup lang="ts">
useHead({
  htmlAttrs: { 'data-color-mode-forced': 'light' },
  meta: [{ name: 'robots', content: 'noindex, nofollow' }]
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 text-gray-900">
    <slot />
  </div>
</template>
