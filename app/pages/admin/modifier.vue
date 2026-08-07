<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import { TYPES_PRATICIENS, AGES_OPTIONS } from '~/types/index'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Modifier une fiche — Administration TSA' })

const route = useRoute()
const praticienId = route.query.id as string
const token = ref('')
const loading = ref(true)
const success = ref(false)
const erreur = ref('')
const notice = ref('')

const form = reactive({
  nom: '', type: '', adresse: '', ville: '', departement: '',
  telephone: '', site_web: '', teleconsultation: false,
  delai: '', notes: '', ages: [] as string[], adeli: ''
})

const types = TYPES_PRATICIENS
const agesOptions = AGES_OPTIONS
const delais = ['', 'Disponible', 'Quelques semaines', '1 à 3 mois', '3 à 6 mois', 'Plus de 6 mois']

onMounted(async () => {
  token.value = sessionStorage.getItem('admin_token') || ''
  if (!token.value) { navigateTo('/admin/login'); return }
  await chargerFiche()
})

async function adminFetch(url: string, options: any = {}) {
  const res = await fetch('/api/' + url, {
    ...options,
    headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token.value, ...options.headers }
  })
  if (res.status === 401) { navigateTo('/admin/login'); throw new Error('Non authentifié') }
  if (!res.ok) throw new Error('Erreur ' + res.status)
  return res.json()
}

async function chargerFiche() {
  if (!praticienId) { erreur.value = 'Aucun praticien spécifié.'; loading.value = false; return }
  try {
    const data = await adminFetch('admin_praticiens.php?id=' + praticienId)
    if (!data?.id) { erreur.value = 'Fiche introuvable.'; loading.value = false; return }
    form.nom = data.nom || ''
    form.type = data.type || ''
    form.adresse = data.adresse || ''
    form.ville = data.ville || ''
    form.departement = data.departement || ''
    form.telephone = data.telephone || ''
    form.site_web = data.site_web || ''
    form.teleconsultation = !!data.teleconsultation
    form.delai = data.delai || ''
    form.notes = data.notes || ''
    form.ages = data.ages || []
    form.adeli = data.adeli || ''
    nextTick(() => { editor.value?.commands.setContent(form.notes) })
  } catch (e: any) { erreur.value = 'Erreur : ' + e.message }
  finally { loading.value = false }
}

function toggleAge(age: string) {
  const idx = form.ages.indexOf(age)
  if (idx === -1) form.ages.push(age)
  else form.ages.splice(idx, 1)
}

const editor = useEditor({
  extensions: [
    StarterKit,
    Underline,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Link.configure({ openOnClick: false }),
  ],
  content: '',
  editorProps: {
    attributes: {
      class: 'prose prose-sm max-w-none min-h-[160px] px-4 py-3 outline-none'
    }
  }
})

function setLink() {
  const url = prompt('URL du lien :')
  if (!url) return
  editor.value?.chain().focus().setLink({ href: url }).run()
}

onUnmounted(() => editor.value?.destroy())

async function sauvegarder() {
  notice.value = ''
  if (!form.nom || !form.type || !form.ville || !form.departement || !form.ages.length) {
    notice.value = 'Merci de renseigner : nom, type, ville, département et public reçu.'
    return
  }
  try {
    await adminFetch('admin_praticiens.php?id=' + praticienId, {
      method: 'PATCH',
      body: JSON.stringify({
        nom: form.nom, type: form.type, ville: form.ville,
        departement: form.departement.substring(0, 2),
        adresse: form.adresse || null,
        telephone: form.telephone || null,
        site_web: form.site_web || null,
        teleconsultation: form.teleconsultation,
        delai: form.delai || null,
        notes: editor.value?.getHTML() || null,
        ages: form.ages,
        adeli: form.adeli || null
      })
    })
    success.value = true
    window.scrollTo(0, 0)
  } catch (e: any) { notice.value = 'Une erreur est survenue : ' + e.message }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">

    <!-- NAVBAR -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div class="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <NuxtLink to="/admin" class="flex items-center gap-2 font-bold text-gray-900">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Administration
        </NuxtLink>
      </div>
    </header>

    <div class="max-w-3xl mx-auto px-4 py-6">

      <!-- En-tête -->
      <div class="mb-6 pb-4 border-b border-gray-200">
        <h1 class="text-2xl font-bold text-gray-900">Modifier une fiche</h1>
        <p class="text-sm text-gray-500 mt-1">Les modifications sont visibles immédiatement sur l'annuaire.</p>
      </div>

      <!-- Chargement -->
      <div v-if="loading" class="flex justify-center py-16">
        <svg class="animate-spin text-gray-400 w-8 h-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
      </div>

      <!-- Erreur -->
      <div v-else-if="erreur" class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{{ erreur }}</div>

      <!-- Succès -->
      <div v-else-if="success" class="text-center py-16">
        <div class="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h2 class="text-lg font-semibold mb-2">Fiche mise à jour !</h2>
        <p class="text-gray-500 text-sm mb-6">Les modifications sont visibles immédiatement.</p>
        <NuxtLink to="/admin" class="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">← Retour à l'admin</NuxtLink>
      </div>

      <!-- Formulaire -->
      <div v-else class="space-y-4">
        <div v-if="notice" class="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{{ notice }}</div>

        <!-- Identité -->
        <UCard>
          <h2 class="font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">Identité</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UFormField label="Nom et prénom *">
              <UInput v-model="form.nom" />
            </UFormField>
            <UFormField label="Type de professionnel *">
              <select v-model="form.type" aria-label="Type de professionnel" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900">
                <option v-for="t in types" :key="t" :value="t">{{ t }}</option>
              </select>
            </UFormField>
          </div>
          <UFormField label="Numéro ADELI ou RPPS" class="mt-4">
            <UInput v-model="form.adeli" />
          </UFormField>
          <UFormField label="Public reçu *" class="mt-4">
            <div class="flex flex-wrap gap-3 mt-1">
              <label v-for="age in agesOptions" :key="age" class="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" :checked="form.ages.includes(age)" @change="toggleAge(age)" class="rounded" />
                {{ age }}
              </label>
            </div>
          </UFormField>
        </UCard>

        <!-- Localisation -->
        <UCard>
          <h2 class="font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">Localisation</h2>
          <UFormField label="Adresse" class="mb-4">
            <UInput v-model="form.adresse" />
          </UFormField>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UFormField label="Ville *">
              <UInput v-model="form.ville" />
            </UFormField>
            <UFormField label="Département *">
              <UInput v-model="form.departement" maxlength="5" />
            </UFormField>
          </div>
        </UCard>

        <!-- Contact & pratique -->
        <UCard>
          <h2 class="font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">Contact & pratique</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <UFormField label="Téléphone">
              <UInput v-model="form.telephone" type="tel" />
            </UFormField>
            <UFormField label="Site web ou Doctolib">
              <UInput v-model="form.site_web" type="url" />
            </UFormField>
          </div>
          <UFormField label="Délai d'attente" class="mb-4">
            <select v-model="form.delai" aria-label="Délai d'attente" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900">
              <option value="">— Non renseigné —</option>
              <option v-for="d in delais.slice(1)" :key="d" :value="d">{{ d }}</option>
            </select>
          </UFormField>
          <label class="flex items-center gap-2 cursor-pointer text-sm">
            <input type="checkbox" v-model="form.teleconsultation" class="rounded" />
            Propose la téléconsultation
          </label>
        </UCard>

        <!-- Notes -->
        <UCard>
          <h2 class="font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">Informations complémentaires</h2>
          <UFormField label="Notes">
            <template #description>Approche thérapeutique, langues, accessibilité…</template>

            <!-- Barre d'outils Tiptap -->
            <div v-if="editor" class="flex flex-wrap gap-1 mb-3 pb-3 border-b border-gray-100">
              <template v-for="action in [
                { cmd: () => editor!.chain().focus().toggleBold().run(), active: editor.isActive('bold'), icon: 'i-lucide-bold', title: 'Gras' },
                { cmd: () => editor!.chain().focus().toggleItalic().run(), active: editor.isActive('italic'), icon: 'i-lucide-italic', title: 'Italique' },
                { cmd: () => editor!.chain().focus().toggleUnderline().run(), active: editor.isActive('underline'), icon: 'i-lucide-underline', title: 'Souligné' },
              ]" :key="action.title">
                <button type="button" :title="action.title" :class="['p-1.5 rounded transition-colors', action.active ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100']" @click="action.cmd">
                  <UIcon :name="action.icon" class="w-4 h-4" />
                </button>
              </template>
              <span class="w-px bg-gray-200 mx-1" />
              <template v-for="action in [
                { cmd: () => editor!.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }), label: 'H2', title: 'Titre' },
                { cmd: () => editor!.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive('heading', { level: 3 }), label: 'H3', title: 'Sous-titre' },
              ]" :key="action.title">
                <button type="button" :title="action.title" :class="['px-2 py-1 rounded text-xs font-bold transition-colors', action.active ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100']" @click="action.cmd">
                  {{ action.label }}
                </button>
              </template>
              <span class="w-px bg-gray-200 mx-1" />
              <template v-for="action in [
                { cmd: () => editor!.chain().focus().setTextAlign('left').run(), active: editor.isActive({ textAlign: 'left' }), icon: 'i-lucide-align-left', title: 'Gauche' },
                { cmd: () => editor!.chain().focus().setTextAlign('center').run(), active: editor.isActive({ textAlign: 'center' }), icon: 'i-lucide-align-center', title: 'Centrer' },
                { cmd: () => editor!.chain().focus().setTextAlign('right').run(), active: editor.isActive({ textAlign: 'right' }), icon: 'i-lucide-align-right', title: 'Droite' },
                { cmd: () => editor!.chain().focus().setTextAlign('justify').run(), active: editor.isActive({ textAlign: 'justify' }), icon: 'i-lucide-align-justify', title: 'Justifier' },
              ]" :key="action.title">
                <button type="button" :title="action.title" :class="['p-1.5 rounded transition-colors', action.active ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100']" @click="action.cmd">
                  <UIcon :name="action.icon" class="w-4 h-4" />
                </button>
              </template>
              <span class="w-px bg-gray-200 mx-1" />
              <template v-for="action in [
                { cmd: () => editor!.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList'), icon: 'i-lucide-list', title: 'Liste' },
                { cmd: () => editor!.chain().focus().toggleBlockquote().run(), active: editor.isActive('blockquote'), icon: 'i-lucide-quote', title: 'Citation' },
                { cmd: setLink, active: editor.isActive('link'), icon: 'i-lucide-link', title: 'Lien' },
              ]" :key="action.title">
                <button type="button" :title="action.title" :class="['p-1.5 rounded transition-colors', action.active ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100']" @click="action.cmd">
                  <UIcon :name="action.icon" class="w-4 h-4" />
                </button>
              </template>
            </div>

            <div class="border border-gray-200 rounded-lg overflow-hidden focus-within:border-blue-500 transition-colors min-h-[180px]">
              <EditorContent :editor="editor" />
            </div>
          </UFormField>
        </UCard>

        <!-- Actions -->
        <div class="flex justify-end gap-3">
          <NuxtLink to="/admin" class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Annuler</NuxtLink>
          <button type="button" class="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors" @click="sauvegarder">Enregistrer</button>
        </div>
      </div>
    </div>
  </div>
</template>
