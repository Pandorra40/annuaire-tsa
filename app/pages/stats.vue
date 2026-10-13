<script setup lang="ts">
// Ancienne URL publique : redirigée vers l’admin (auth requise).
await navigateTo('/admin/stats', { redirectCode: 301, external: false })
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center text-sm text-gray-500">
    Redirection…
  </div>
</template>
