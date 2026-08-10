<script setup lang="ts">
const navLinks = [
  { label: 'Annuaire', to: '/' },
  { label: 'Associations', to: '/associations' },
  { label: 'CRA', to: '/cra' },
  { label: 'Ressources', to: '/ressources/livres' }
]

const mobileMenuOpen = ref(false)
const route = useRoute()
watch(() => route.path, () => { mobileMenuOpen.value = false })

const tailles = ['text-sm', 'text-md', 'text-lg', 'text-xl']
const tailleIdx = ref(1)
const lectureMode = ref(false)
const contrasteMode = ref(false)

onMounted(() => {
  try {
    tailleIdx.value = Number(localStorage.getItem('tailleIdx') ?? 1)
    lectureMode.value = localStorage.getItem('lecture') === '1'
    contrasteMode.value = localStorage.getItem('contraste') === '1'
  } catch {}
  applyAccess()
})

function applyAccess() {
  const html = document.documentElement
  tailles.forEach(t => html.classList.remove(t))
  html.classList.add(tailles[tailleIdx.value])
  html.classList.toggle('lecture', lectureMode.value)
  html.classList.toggle('contraste', contrasteMode.value)
}

function agrandir() {
  if (tailleIdx.value < tailles.length - 1) {
    tailleIdx.value++
    try { localStorage.setItem('tailleIdx', String(tailleIdx.value)) } catch {}
    applyAccess()
  }
}

function reduire() {
  if (tailleIdx.value > 0) {
    tailleIdx.value--
    try { localStorage.setItem('tailleIdx', String(tailleIdx.value)) } catch {}
    applyAccess()
  }
}

function toggleLecture() {
  lectureMode.value = !lectureMode.value
  try { localStorage.setItem('lecture', lectureMode.value ? '1' : '0') } catch {}
  applyAccess()
}

function toggleContraste() {
  contrasteMode.value = !contrasteMode.value
  try { localStorage.setItem('contraste', contrasteMode.value ? '1' : '0') } catch {}
  applyAccess()
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 text-gray-900">

    <!-- NAVBAR -->
    <header class="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
      <!-- flex-wrap et min-h plutôt qu'une hauteur fixe : en mode lecture, ou
           avec le texte agrandi, la barre déborde et le bouton recouvrait la
           navigation. Elle passe désormais sur deux lignes. -->
      <div class="max-w-6xl mx-auto px-6 min-h-16 py-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">

        <div class="flex items-center gap-6">
          <NuxtLink to="/" class="flex items-center gap-2.5 font-black text-gray-900 text-lg tracking-tight shrink-0">
            <img src="/logo-tsa.svg" alt="" class="h-7 w-auto" />
            Annuaire TSA
          </NuxtLink>
          <nav class="hidden md:flex items-center gap-5">
            <NuxtLink
              v-for="link in navLinks"
              :key="link.to"
              :to="link.to"
              class="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
              active-class="text-gray-900"
              exact-active-class="font-semibold"
            >
              {{ link.label }}
            </NuxtLink>
          </nav>
        </div>

        <div class="flex items-center gap-2">
          <NuxtLink to="/suggerer" class="hidden sm:inline-flex px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition-colors">
            Suggérer un praticien
          </NuxtLink>

          <button type="button" class="hidden sm:flex p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors font-bold text-sm leading-none" :disabled="tailleIdx === 0" aria-label="Réduire la taille du texte" @click="reduire">A-</button>
          <button type="button" class="hidden sm:flex p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors font-bold text-sm leading-none" :disabled="tailleIdx === 3" aria-label="Agrandir la taille du texte" @click="agrandir">A+</button>

          <button type="button"
            :class="['hidden sm:flex p-2 rounded-lg transition-colors text-sm', lectureMode ? 'bg-amber-100 text-amber-700' : 'text-gray-600 hover:bg-gray-100']"
            aria-label="Mode lecture simplifiée"
            @click="toggleLecture"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          </button>

          <button type="button"
            :class="['hidden sm:flex p-2 rounded-lg transition-colors', contrasteMode ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100']"
            aria-label="Mode contraste élevé"
            @click="toggleContraste"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20z" fill="currentColor"/></svg>
          </button>

          <button type="button"
            class="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            :aria-label="mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'"
            :aria-expanded="mobileMenuOpen"
            aria-controls="mobile-menu"
            @click="mobileMenuOpen = !mobileMenuOpen"
          >
            <svg v-if="!mobileMenuOpen" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
            <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- v-show et non v-if : le bouton ci-dessus pointe vers cet identifiant par
           aria-controls, qui doit exister dans la page même menu fermé. -->
      <div v-show="mobileMenuOpen" id="mobile-menu" class="md:hidden border-t border-gray-200 bg-white px-4 py-3 space-y-1">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors text-center"
          active-class="bg-gray-900 text-white font-semibold"
        >
          {{ link.label }}
        </NuxtLink>
        <NuxtLink to="/suggerer" class="block px-3 py-2 rounded-lg text-sm font-semibold bg-gray-900 text-white text-center mt-2">
          Suggérer un praticien
        </NuxtLink>

        <div class="border-t border-gray-100 pt-3 mt-2">
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">Accessibilité</p>
          <div class="flex items-center justify-between px-3 py-2">
            <div class="flex items-center gap-2">
              <button type="button" :disabled="tailleIdx === 0" class="px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-bold text-gray-700 disabled:opacity-40" @click="reduire">A-</button>
              <button type="button" :disabled="tailleIdx === 3" class="px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-bold text-gray-700 disabled:opacity-40" @click="agrandir">A+</button>
            </div>
            <div class="flex items-center gap-2">
              <button type="button" :class="['px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors', lectureMode ? 'bg-amber-100 border-amber-300 text-amber-700' : 'border-gray-300 text-gray-700']" @click="toggleLecture">Lecture</button>
              <button type="button" :class="['px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors', contrasteMode ? 'bg-gray-900 border-gray-900 text-white' : 'border-gray-300 text-gray-700']" @click="toggleContraste">Contraste</button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <slot />

    <!-- FOOTER -->
    <footer class="bg-white border-t border-gray-100 py-10">
      <div class="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p class="font-black text-gray-900 mb-1">Annuaire TSA</p>
          <p class="text-sm text-gray-500">Projet open source · Données hébergées en France · RGPD</p>
          <p class="text-sm text-gray-500">Fait avec ♥ pour les familles concernées par les TSA</p>
        </div>
        <div class="flex flex-wrap items-center gap-5 text-sm">
          <NuxtLink to="/apropos" class="text-gray-500 hover:text-gray-900 transition-colors">À propos</NuxtLink>
          <NuxtLink to="/mentions" class="text-gray-500 hover:text-gray-900 transition-colors">Mentions légales</NuxtLink>
          <NuxtLink to="/donnees-praticiens" class="text-gray-500 hover:text-gray-900 transition-colors">Praticiens : vos données</NuxtLink>
          <NuxtLink to="/couts" class="text-gray-500 hover:text-gray-900 transition-colors">Ce que coûte ce site</NuxtLink>
          <NuxtLink to="/contact" class="text-gray-500 hover:text-gray-900 transition-colors">Contact</NuxtLink>
<a href="https://github.com/Pandorra40/annuaire-tsa" target="_blank" rel="noopener" class="text-gray-500 hover:text-gray-900 transition-colors" aria-label="GitHub">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
          </a>
        </div>
      </div>
    </footer>

  </div>
</template>
