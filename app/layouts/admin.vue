<script setup lang="ts">
useHead({
  htmlAttrs: { 'data-color-mode-forced': 'light' }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 text-gray-900">
    <slot />
  </div>
</template>
