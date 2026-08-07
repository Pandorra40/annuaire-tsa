<script setup lang="ts">
import type { Praticien } from '~/types/index'
import { initiales, isNew } from '~/composables/usePraticien'

const route = useRoute()
const router = useRouter()
const id = Number(route.params.id)
const { fetchPraticien, confirmerFiche, envoyerMessage } = useApi()

// « Retour à l'annuaire » : rejoue l'historique si on vient du site
// (restaure pagination + position de défilement), sinon va à l'accueil.
function retourAnnuaire() {
  const prev = import.meta.client ? (window.history.state?.back as string | undefined) : undefined
  if (prev && prev.startsWith('/')) router.back()
  else router.push('/')
}

// Rendu au build pour que les moteurs voient la fiche (SEO) et que le contenu
// s'affiche immédiatement.
const { data, status } = await useAsyncData(`praticien-${id}`, () => fetchPraticien(id))

// La page étant prérendue, son contenu date du dernier build. `refresh()` ne
// suffit pas à le remplacer : il faut relire l'API au montage et servir cette
// version-là. Sans ça, une correction faite dans l'admin — adresse, tarifs,
// notes, activation du formulaire — n'apparaîtrait qu'après avoir régénéré et
// retransféré tout le site.
const fraiche = ref<Praticien | null>(null)

const praticien = computed<Praticien | null>(() => fraiche.value ?? data.value?.[0] ?? null)

onMounted(async () => {
  try {
    const reponse = await fetchPraticien(id)
    if (reponse?.[0]) fraiche.value = reponse[0]
  } catch {
    // Réseau indisponible : on garde la version du prérendu, déjà affichée.
  }
})

useSeoMeta({
  title: computed(() => praticien.value ? `${praticien.value.nom} — Annuaire TSA` : 'Fiche praticien — Annuaire TSA'),
  description: computed(() => praticien.value ? `${praticien.value.type} spécialisé TSA à ${praticien.value.ville}` : '')
})

const alreadyVoted = ref(false)
const voteCount = ref(0)
const voteThanks = ref(false)
const copied = ref(false)
const shareUrl = computed(() => encodeURIComponent(import.meta.client ? window.location.href : ''))
let copiedTimer: ReturnType<typeof setTimeout> | null = null

function partager() {
  navigator.clipboard.writeText(window.location.href)
  copied.value = true
  if (copiedTimer) clearTimeout(copiedTimer)
  copiedTimer = setTimeout(() => copied.value = false, 2000)
}

onUnmounted(() => { if (copiedTimer) clearTimeout(copiedTimer) })

onMounted(() => {
  alreadyVoted.value = localStorage.getItem(`verified_${id}`) === '1'
  if (praticien.value) voteCount.value = praticien.value.confirmations
})

watch(praticien, (val) => {
  if (val) voteCount.value = val.confirmations
})

// ---- Formulaire de contact -------------------------------------------------
// Affiché seulement si le praticien y a consenti. Son adresse n'est jamais
// transmise au navigateur : le serveur ne publie que `contact_actif`, suivi
// comme le reste de la fiche par la relecture au montage ci-dessus.
const contactActif = computed(() => !!praticien.value?.contact_actif)

const formOuvert = ref(false)
const message = reactive({ nom: '', email: '', message: '', hp: '' })
const consentDonnees = ref(false)
const envoi = ref(false)
const envoye = ref(false)
const erreurEnvoi = ref('')
const ouvertureTs = ref(0)

function ouvrirFormulaire() {
  formOuvert.value = true
  ouvertureTs.value = Date.now()
}

async function envoyer() {
  erreurEnvoi.value = ''
  if (!message.nom.trim() || !message.email.trim() || !message.message.trim()) {
    erreurEnvoi.value = 'Merci de remplir votre nom, votre email et votre message.'
    return
  }
  if (!consentDonnees.value) {
    erreurEnvoi.value = 'Merci de cocher la case avant l’envoi.'
    return
  }
  envoi.value = true
  try {
    await envoyerMessage({
      praticien_id: id,
      nom: message.nom.trim(),
      email: message.email.trim(),
      message: message.message.trim(),
      hp: message.hp,
      elapsed: Date.now() - ouvertureTs.value
    })
    envoye.value = true
  } catch (e: any) {
    erreurEnvoi.value = e?.data?.error ?? 'L’envoi a échoué. Réessayez dans un instant.'
  } finally {
    envoi.value = false
  }
}

async function confirmer() {
  if (alreadyVoted.value) return
  alreadyVoted.value = true
  voteThanks.value = true
  localStorage.setItem(`verified_${id}`, '1')
  voteCount.value++
  try {
    await confirmerFiche(id)
  } catch {
    // Rollback silencieux : la confirmation locale reste mais le serveur a échoué
    voteCount.value--
    localStorage.removeItem(`verified_${id}`)
    alreadyVoted.value = false
    voteThanks.value = false
  }
}
</script>

<template>
  <div>

    <!-- CHARGEMENT / ERREUR -->
    <section v-if="status === 'pending' && !praticien" class="bg-gray-50 min-h-screen flex justify-center items-center py-16">
      <svg class="animate-spin text-gray-400 w-10 h-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
      </svg>
    </section>

    <section v-else-if="status === 'error' || !praticien" class="bg-gray-50 min-h-screen py-16">
      <div class="max-w-3xl mx-auto px-6">
        <button type="button" class="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm mb-6 transition-colors font-medium" @click="retourAnnuaire">
          ← Retour à l'annuaire
        </button>
        <div class="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700">
          Fiche introuvable. Ce praticien n'existe pas ou a été supprimé.
        </div>
      </div>
    </section>

    <template v-else>

      <!-- EN-TÊTE PRATICIEN -->
      <section class="relative overflow-hidden py-14" style="background: linear-gradient(160deg, #f8f4ff 0%, #f0f9ff 40%, #f0fdf4 70%, #fffbeb 100%)">
        <div class="absolute top-0 left-0 right-0 h-1" style="background: linear-gradient(90deg, #f87171, #fb923c, #fbbf24, #4ade80, #60a5fa, #a78bfa, #f472b6)" />
        <div class="absolute inset-0 pointer-events-none" style="background: radial-gradient(ellipse at 80% 50%, rgba(99,102,241,0.07) 0%, transparent 60%)" />

        <div class="relative max-w-4xl mx-auto px-6">
          <button type="button" class="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm mb-8 transition-colors font-medium" @click="retourAnnuaire">
            ← Retour à l'annuaire
          </button>

          <div class="flex items-start gap-6">
            <div class="w-20 h-20 rounded-2xl flex items-center justify-center font-black text-white text-2xl shrink-0 shadow-lg" style="background: linear-gradient(135deg, #6366f1, #8b5cf6)">
              {{ initiales(praticien.nom) }}
            </div>

            <div class="flex-1">
              <div class="flex items-center gap-3 flex-wrap mb-2">
                <h1 class="text-3xl font-black text-gray-900">{{ praticien.nom }}</h1>
                <span v-if="isNew(praticien.created_at)" class="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">● Nouveau</span>
              </div>
              <p class="text-gray-500 text-lg mb-4">
                {{ praticien.type }} · {{ praticien.ville }}
                <NuxtLink v-if="praticien.departement" :to="`/departement/${praticien.departement}`" class="hover:text-indigo-600 transition-colors">({{ praticien.departement }})</NuxtLink>
              </p>
              <div class="flex flex-wrap gap-2">
                <span v-for="age in praticien.ages" :key="age" class="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full border border-indigo-200">{{ age }}</span>
                <span v-if="praticien.teleconsultation" class="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full border border-emerald-200">Téléconsultation</span>
                <span v-if="praticien.delai" class="px-3 py-1 text-sm font-medium rounded-full border" :class="praticien.delai === 'Disponible' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'">
                  Délai : {{ praticien.delai }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CONTENU -->
      <section class="bg-gray-50 py-10">
        <div class="max-w-4xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-5">

          <!-- COLONNE PRINCIPALE -->
          <div class="sm:col-span-2 space-y-5">

            <!-- Notes -->
            <div v-if="praticien.notes" class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 class="font-bold text-gray-900 text-lg mb-4 flex items-center gap-3">
                <span class="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-base">📝</span>
                Informations complémentaires
              </h2>
              <div class="notes-content text-gray-600 text-sm leading-relaxed" v-html="praticien.notes" />
            </div>

            <!-- Confirmations -->
            <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 class="font-bold text-gray-900 text-lg mb-4 flex items-center gap-3">
                <span class="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-base">👥</span>
                Avis de la communauté
              </h2>
              <div class="flex items-center gap-4 mb-4">
                <div class="text-4xl font-black text-emerald-600">{{ voteCount }}</div>
                <div>
                  <div class="font-semibold text-gray-900">confirmation{{ voteCount > 1 ? 's' : '' }}</div>
                  <div class="text-sm text-gray-500">Des familles ont vérifié cette fiche</div>
                </div>
              </div>
              <button type="button"
                :disabled="alreadyVoted"
                class="w-full py-2.5 border-2 rounded-xl font-semibold text-sm transition-colors"
                :class="alreadyVoted ? 'border-emerald-200 bg-emerald-50 text-emerald-700 cursor-default' : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'"
                @click="confirmer"
              >
                {{ alreadyVoted ? '✓ Confirmé' : '✓ Confirmer cette fiche' }}
              </button>
              <p v-if="voteThanks" class="text-sm text-emerald-600 mt-3 text-center">Merci pour votre confirmation !</p>
            </div>

          </div>

          <!-- COLONNE LATÉRALE -->
          <div class="space-y-5">

            <!-- Contact -->
            <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 class="font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span class="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-base">📞</span>
                Contact
              </h2>
              <a v-if="praticien.telephone" :href="`tel:${praticien.telephone}`" class="flex items-center gap-3 text-indigo-600 font-semibold hover:text-indigo-700 transition-colors mb-3">
                <div class="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-sm">📞</div>
                {{ praticien.telephone }}
              </a>
              <p v-else class="text-sm text-gray-400 mb-3">Téléphone non renseigné</p>
              <a v-if="praticien.site_web" :href="praticien.site_web" target="_blank" rel="noopener" class="flex items-center gap-3 text-indigo-600 hover:text-indigo-700 transition-colors text-sm">
                <div class="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-sm">🔗</div>
                Site web / Doctolib
              </a>
              <div v-if="praticien.adeli" class="flex items-center gap-3 text-gray-500 text-sm mt-3">
                <div class="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-sm">🪪</div>
                <span>N° ADELI : {{ praticien.adeli }}</span>
              </div>

              <!-- FORMULAIRE DE CONTACT (si le praticien y a consenti) -->
              <template v-if="contactActif">
                <div class="border-t border-gray-100 mt-4 pt-4">

                  <div v-if="envoye" class="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-4 leading-relaxed">
                    <span class="font-semibold">Message envoyé.</span><br>
                    {{ praticien.nom }} vous répondra directement à l’adresse que vous avez indiquée.
                  </div>

                  <button type="button"
                    v-else-if="!formOuvert"
                    class="w-full py-2.5 border-2 border-indigo-200 text-indigo-700 rounded-xl font-semibold text-sm hover:bg-indigo-50 transition-colors"
                    @click="ouvrirFormulaire"
                  >
                    ✉️ Écrire à ce praticien
                  </button>

                  <form v-else class="space-y-3" @submit.prevent="envoyer">
                    <p class="text-xs text-gray-500 leading-relaxed">
                      Pas besoin d’appeler : votre message lui parvient par email, et sa réponse
                      arrivera dans votre boîte.
                    </p>

                    <div v-if="erreurEnvoi" class="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
                      ⚠️ {{ erreurEnvoi }}
                    </div>

                    <input
                      v-model="message.nom"
                      type="text"
                      aria-label="Votre nom"
                      placeholder="Votre nom"
                      maxlength="100"
                      class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                    />
                    <input
                      v-model="message.email"
                      type="email"
                      aria-label="Votre adresse email, pour que le praticien puisse vous répondre"
                      placeholder="Votre email"
                      class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                    />
                    <textarea
                      v-model="message.message"
                      rows="5"
                      maxlength="2000"
                      aria-label="Votre message"
                      placeholder="Votre message. Décrivez votre demande — inutile d’entrer dans le détail médical."
                      class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 text-gray-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-vertical transition-all"
                    />

                    <!-- Champ piège : hors écran, jamais rempli par un humain -->
                    <input
                      v-model="message.hp"
                      type="text"
                      aria-label="Ne pas remplir"
                      tabindex="-1"
                      autocomplete="off"
                      aria-hidden="true"
                      class="absolute -left-[9999px] w-px h-px opacity-0"
                    />

                    <label class="flex items-start gap-2 text-xs text-gray-600 leading-relaxed cursor-pointer">
                      <input v-model="consentDonnees" type="checkbox" class="mt-0.5 rounded border-gray-300" />
                      <span>
                        J’accepte que mon nom, mon email et mon message soient transmis à ce
                        praticien pour qu’il puisse me répondre.
                      </span>
                    </label>

                    <button
                      :disabled="envoi"
                      type="submit"
                      class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm disabled:opacity-50 transition-colors"
                    >
                      {{ envoi ? 'Envoi…' : 'Envoyer le message →' }}
                    </button>

                    <p class="text-xs text-gray-500 leading-relaxed">
                      Votre message est transmis directement à ce praticien. Il n’est lu par
                      personne d’autre et n’est conservé nulle part — ni sur le site, ni par
                      son éditeur.
                      <NuxtLink to="/mentions" class="underline hover:text-gray-700">En savoir plus</NuxtLink>
                    </p>
                  </form>

                </div>
              </template>
            </div>

            <!-- Localisation -->
            <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 class="font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span class="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-base">📍</span>
                Localisation
              </h2>
              <p class="text-gray-600 text-sm mb-3">
                {{ [praticien.adresse, praticien.ville, praticien.departement ? `(${praticien.departement})` : ''].filter(Boolean).join(', ') || 'Adresse non renseignée' }}
              </p>
              <NuxtLink v-if="praticien.departement" :to="`/departement/${praticien.departement}`" class="inline-flex items-center gap-1.5 text-indigo-600 text-sm hover:text-indigo-700 transition-colors font-medium">
                Voir tous les praticiens du {{ praticien.departement }} →
              </NuxtLink>
            </div>

            <!-- Exactitude de la fiche : un seul encadré pour les deux publics, placé
                 avant « Partager » car un praticien arrive ici depuis son propre nom et
                 n'ira pas chercher en bas de colonne. Le vocabulaire compte autant que
                 la position : « signaler une erreur » est ce que fait un visiteur, un
                 praticien pense « corriger ma fiche ». -->
            <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 class="font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span class="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-base">🚩</span>
                Cette fiche est-elle exacte ?
              </h2>

              <p class="font-semibold text-gray-900 text-sm mb-2">Vous consultez cette fiche ?</p>
              <p class="text-sm text-gray-600 leading-relaxed">
                Une information vous semble inexacte ou obsolète ?
              </p>
              <NuxtLink
                :to="`/signaler?id=${praticien.id}`"
                class="inline-flex items-center gap-1.5 mt-2 text-sm text-amber-700 hover:text-amber-900 transition-colors font-medium"
              >
                Signaler une erreur →
              </NuxtLink>

              <div class="border-t border-gray-100 mt-5 pt-5">
                <p class="font-semibold text-gray-900 text-sm mb-2">Vous êtes ce praticien ?</p>
                <p class="text-sm text-gray-600 leading-relaxed mb-4">
                  Cette fiche vous concerne et reste modifiable à tout moment.
                  Aucun justificatif ne vous sera demandé.
                </p>
                <div class="space-y-2">
                  <NuxtLink
                    :to="`/signaler?id=${praticien.id}&motif=correction`"
                    class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    <UIcon name="i-lucide-pencil" class="w-4 h-4" />
                    Corriger mes informations
                  </NuxtLink>
                  <NuxtLink
                    :to="`/signaler?id=${praticien.id}&motif=retrait`"
                    class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    <UIcon name="i-lucide-x" class="w-4 h-4" />
                    Retirer ma fiche
                  </NuxtLink>
                </div>
                <p class="text-xs text-gray-400 mt-3 text-center">
                  <NuxtLink to="/donnees-praticiens" class="hover:text-gray-600 underline">
                    D'où viennent ces informations et quels sont vos droits
                  </NuxtLink>
                </p>
              </div>
            </div>

            <!-- Partager -->
            <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 class="font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span class="w-9 h-9 rounded-xl bg-sky-100 flex items-center justify-center text-base">🔗</span>
                Partager
              </h2>
              <div class="flex items-center gap-3">
                <a
                  :href="`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`"
                  target="_blank"
                  rel="noopener"
                  aria-label="Partager sur Facebook"
                  title="Partager sur Facebook"
                  class="w-11 h-11 rounded-xl bg-[#1877F2] text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                >
                  <UIcon name="i-simple-icons-facebook" class="w-5 h-5" />
                </a>
                <button type="button"
                  aria-label="Copier le lien de la fiche"
                  title="Copier le lien"
                  class="flex-1 h-11 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                  @click="partager"
                >
                  <UIcon :name="copied ? 'i-lucide-check' : 'i-lucide-link'" class="w-4 h-4" />
                  {{ copied ? 'Lien copié !' : 'Copier le lien' }}
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

    </template>

  </div>
</template>

<style scoped>
/* Aère les blocs des « Informations complémentaires » (notes en v-html) */
.notes-content :deep(p) {
  margin-bottom: 0.9rem;
}
.notes-content :deep(p:last-child) {
  margin-bottom: 0;
}
.notes-content :deep(strong) {
  display: block;
  color: #4f46e5;
  font-weight: 600;
  margin-bottom: 0.15rem;
}
.notes-content :deep(a) {
  color: #4f46e5;
  text-decoration: underline;
}
</style>
