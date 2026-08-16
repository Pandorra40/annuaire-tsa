<script setup lang="ts">
definePageMeta({ layout: false })
useSeoMeta({
  title: 'Connexion — Administration TSA',
  robots: 'noindex, nofollow'
})

const mdp = ref('')
const erreur = ref('')
const tentatives = ref(0)
const bloque = ref(false)
const compte = ref(30)
const loading = ref(false)
const MAX = 5

onMounted(() => {
  if (sessionStorage.getItem('admin_token')) navigateTo('/admin')
})

async function connexion() {
  if (tentatives.value >= MAX || bloque.value) return
  if (!mdp.value) {
    erreur.value = 'Merci de renseigner votre mot de passe.'
    return
  }
  loading.value = true
  erreur.value = ''
  try {
    const res = await fetch('/api/auth.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: mdp.value })
    })
    if (!res.ok) {
      tentatives.value++
      erreur.value = 'Mot de passe incorrect.'
      if (tentatives.value >= MAX) bloquer()
      return
    }
    const data = await res.json()
    sessionStorage.setItem('admin_token', data.token)
    navigateTo('/admin')
  } catch (e) {
    erreur.value = 'Erreur de connexion : ' + (e as Error).message
  } finally {
    loading.value = false
  }
}

function bloquer() {
  bloque.value = true
  compte.value = 30
  const t = setInterval(() => {
    compte.value--
    if (compte.value <= 0) {
      clearInterval(t)
      bloque.value = false
      tentatives.value = 0
    }
  }, 1000)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') connexion()
}
</script>

<template>
  <div style="min-height:100vh; background:#f9fafb; display:flex; align-items:center; justify-content:center; padding:1rem; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">

    <div style="width:100%; max-width:380px;">

      <!-- Logo -->
      <div style="text-align:center; margin-bottom:2rem;">
        <a href="/" style="display:inline-flex; align-items:center; gap:0.5rem; font-weight:700; font-size:1.2rem; color:#111827; text-decoration:none;">
          <img src="/logo-tsa.svg" alt="Annuaire TSA" style="height:2.25rem;" />
          Annuaire TSA
        </a>
        <p style="color:#6b7280; font-size:0.875rem; margin-top:0.5rem;">Espace d'administration</p>
      </div>

      <!-- Carte -->
      <div style="background:#ffffff; border:1px solid #e5e7eb; border-radius:1rem; padding:2rem; box-shadow:0 1px 3px rgba(0,0,0,0.07);">

        <h1 style="font-size:1.1rem; font-weight:700; color:#111827; margin-bottom:1.5rem;">Connexion</h1>

        <!-- Bloqué -->
        <div v-if="bloque" style="background:#fffbeb; border:1px solid #fcd34d; border-radius:0.5rem; padding:0.75rem 1rem; margin-bottom:1rem; font-size:0.875rem; color:#92400e; text-align:center;">
          Accès temporairement bloqué.<br>
          Réessayez dans <strong>{{ compte }}</strong> secondes.
        </div>

        <!-- Erreur -->
        <div v-if="erreur" style="background:#fef2f2; border:1px solid #fecaca; border-radius:0.5rem; padding:0.75rem 1rem; margin-bottom:1rem; font-size:0.875rem; color:#b91c1c;">
          {{ erreur }}
          <span v-if="tentatives > 0 && tentatives < MAX" style="display:block; font-size:0.75rem; margin-top:0.25rem;">
            {{ MAX - tentatives }} tentative{{ MAX - tentatives > 1 ? 's' : '' }} restante{{ MAX - tentatives > 1 ? 's' : '' }}
          </span>
        </div>

        <!-- Formulaire -->
        <div v-if="!bloque">
          <label for="mdp" style="display:block; font-size:0.875rem; font-weight:500; color:#374151; margin-bottom:0.375rem;">Mot de passe</label>
          <input
            id="mdp"
            v-model="mdp"
            type="password"
            placeholder="••••••••••"
            autocomplete="current-password"
            style="width:100%; padding:0.625rem 0.875rem; border:1px solid #d1d5db; border-radius:0.5rem; font-size:0.875rem; color:#111827; background:#ffffff; outline:none; box-sizing:border-box; margin-bottom:1rem;"
            @keydown="onKeydown"
          />
          <button type="button"
            :disabled="loading"
            style="width:100%; padding:0.625rem; background:#111827; color:#ffffff; border:none; border-radius:0.5rem; font-size:0.875rem; font-weight:600; cursor:pointer;"
            @click="connexion"
          >
            {{ loading ? 'Connexion…' : 'Se connecter' }}
          </button>
        </div>

        <div style="text-align:center; margin-top:1.5rem;">
          <a href="/" style="font-size:0.75rem; color:#9ca3af; text-decoration:none;">← Retour au site</a>
        </div>

      </div>
    </div>
  </div>
</template>
