<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import { TYPES_PRATICIENS, AGES_OPTIONS } from '~/types/index'

useSeoMeta({
  title: 'Suggérer un praticien — Annuaire TSA',
  description: 'Vous connaissez un praticien spécialisé dans l\'autisme qui n\'apparaît pas encore dans l\'Annuaire TSA ? Signalez-le ici pour l\'ajouter et aider d\'autres familles à le trouver.'
})

const { suggererPraticien } = useApi()

const form = reactive({
  nom: '',
  type: '',
  ville: '',
  codepostal: '',
  telephone: '',
  site_web: '',
  adeli: '',
  ages: [] as string[],
  consentement: false,
  hp: ''
})

const types = TYPES_PRATICIENS
const agesOptions = AGES_OPTIONS

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

const loading = ref(false)
const success = ref(false)
const error = ref('')

async function soumettre() {
  error.value = ''
  if (form.hp) return
  if (!form.nom || !form.type || !form.ville || !form.codepostal || !form.ages.length || !form.consentement) {
    error.value = 'Merci de remplir tous les champs obligatoires et cocher le consentement RGPD.'
    return
  }
  loading.value = true
  try {
    await suggererPraticien({
      nom: form.nom,
      type: form.type,
      ville: form.ville,
      departement: form.codepostal.substring(0, 2),
      telephone: form.telephone || null,
      site_web: form.site_web || null,
      notes: editor.value?.getHTML() || null,
      adeli: form.adeli || null,
      ages: form.ages,
      statut: 'en_attente',
      source: 'communaute'
    })
    success.value = true
  } catch (e: any) {
    error.value = 'Une erreur est survenue : ' + e.message
  } finally {
    loading.value = false
  }
}

onUnmounted(() => editor.value?.destroy())
</script>

<template>
  <div>

    <!-- EN-TÊTE -->
    <section class="relative overflow-hidden py-16" style="background: linear-gradient(160deg, #f8f4ff 0%, #f0f9ff 40%, #f0fdf4 70%, #fffbeb 100%)">
      <div class="absolute top-0 left-0 right-0 h-1" style="background: linear-gradient(90deg, #f87171, #fb923c, #fbbf24, #4ade80, #60a5fa, #a78bfa, #f472b6)" />
      <div class="absolute inset-0 pointer-events-none" style="background: radial-gradient(ellipse at 30% 50%, rgba(99,102,241,0.07) 0%, transparent 50%)" />
      <div class="relative max-w-3xl mx-auto px-6">
        <NuxtLink to="/" class="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm mb-6 transition-colors font-medium">
          ← Retour à l'annuaire
        </NuxtLink>
        <h1 class="text-4xl sm:text-5xl font-black text-gray-900 mb-3 tracking-tight">Suggérer un praticien</h1>
        <p class="text-gray-500 text-lg max-w-2xl">Vous connaissez un praticien spécialisé TSA qui n'apparaît pas ? Signalez-le ici — nom, ville et spécialité suffisent.</p>
      </div>
    </section>

    <!-- SUCCÈS -->
    <section v-if="success" class="bg-gray-50 py-20">
      <div class="max-w-3xl mx-auto px-6 text-center">
        <div class="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5 text-3xl">
          ✅
        </div>
        <h2 class="text-2xl font-bold mb-3 text-gray-900">Suggestion envoyée !</h2>
        <p class="text-gray-500 mb-8">Merci pour votre contribution. La fiche sera examinée avant publication.</p>
        <NuxtLink to="/" class="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
          ← Retour à l'annuaire
        </NuxtLink>
      </div>
    </section>

    <!-- FORMULAIRE -->
    <section v-else class="bg-gray-50 min-h-screen py-12">
      <div class="max-w-3xl mx-auto px-6 space-y-5">

        <div v-if="error" class="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">
          ⚠️ {{ error }}
        </div>

        <div class="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-sm text-indigo-700">
          ℹ️ Les informations soumises sont utilisées uniquement pour alimenter l'annuaire. Les champs marqués * sont obligatoires.
        </div>

        <!-- Identité -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 class="font-bold text-gray-900 text-lg mb-5 flex items-center gap-3 pb-4 border-b border-gray-100">
            <div class="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-base">👤</div>
            Identité du praticien
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">Nom et prénom *</label>
              <input v-model="form.nom" type="text" placeholder="Dr Marie Dupont" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-gray-50 text-gray-900 transition-all" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">Type de professionnel *</label>
              <select v-model="form.type" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all">
                <option value="">— Choisir —</option>
                <option v-for="t in types" :key="t" :value="t">{{ t }}</option>
              </select>
            </div>
          </div>
          <div class="mt-5">
            <label class="block text-sm font-semibold text-gray-700 mb-2">Public reçu *</label>
            <div class="flex flex-wrap gap-3">
              <label v-for="age in agesOptions" :key="age" class="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                <input type="checkbox" :checked="form.ages.includes(age)" class="checkbox-custom" @change="toggleAge(age)" />
                {{ age }}
              </label>
            </div>
          </div>
          <div class="mt-5">
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">
              Numéro ADELI ou RPPS
              <span class="text-gray-400 font-normal ml-1">(optionnel)</span>
            </label>
            <input v-model="form.adeli" type="text" placeholder="Ex. 123456789" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-gray-50 text-gray-900 transition-all" />
          </div>
        </div>

        <!-- Localisation -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 class="font-bold text-gray-900 text-lg mb-5 flex items-center gap-3 pb-4 border-b border-gray-100">
            <div class="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-base">📍</div>
            Localisation
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">Ville *</label>
              <input v-model="form.ville" type="text" placeholder="Bordeaux" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-gray-50 text-gray-900 transition-all" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">Code postal *</label>
              <input v-model="form.codepostal" type="text" placeholder="33000" maxlength="5" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-gray-50 text-gray-900 transition-all" />
            </div>
          </div>
        </div>

        <!-- Contact -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 class="font-bold text-gray-900 text-lg mb-5 flex items-center gap-3 pb-4 border-b border-gray-100">
            <div class="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-base">📞</div>
            Contact
            <span class="ml-auto text-xs text-gray-400 font-normal">Optionnel</span>
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">Téléphone</label>
              <input v-model="form.telephone" type="tel" placeholder="05 56 12 34 56" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-gray-50 text-gray-900 transition-all" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">Site web ou Doctolib</label>
              <input v-model="form.site_web" type="url" placeholder="https://…" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-gray-50 text-gray-900 transition-all" />
            </div>
          </div>
        </div>

        <!-- Notes avec Tiptap -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 class="font-bold text-gray-900 text-lg mb-5 flex items-center gap-3 pb-4 border-b border-gray-100">
            <div class="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-base">📝</div>
            Notes
            <span class="ml-auto text-xs text-gray-400 font-normal">Optionnel</span>
          </h2>

          <div v-if="editor" class="flex flex-wrap gap-1 mb-3 pb-3 border-b border-gray-100">
            <button title="Gras" :class="['toolbar-btn', editor.isActive('bold') ? 'toolbar-btn-active' : '']" @click="editor!.chain().focus().toggleBold().run()">
              <strong>G</strong>
            </button>
            <button title="Italique" :class="['toolbar-btn', editor.isActive('italic') ? 'toolbar-btn-active' : '']" @click="editor!.chain().focus().toggleItalic().run()">
              <em>I</em>
            </button>
            <button title="Souligné" :class="['toolbar-btn', editor.isActive('underline') ? 'toolbar-btn-active' : '']" @click="editor!.chain().focus().toggleUnderline().run()">
              <span style="text-decoration:underline">S</span>
            </button>
            <span class="w-px bg-gray-200 mx-1" />
            <button title="Titre H2" :class="['toolbar-btn font-bold', editor.isActive('heading', { level: 2 }) ? 'toolbar-btn-active' : '']" @click="editor!.chain().focus().toggleHeading({ level: 2 }).run()">
              H2
            </button>
            <button title="Sous-titre H3" :class="['toolbar-btn font-bold', editor.isActive('heading', { level: 3 }) ? 'toolbar-btn-active' : '']" @click="editor!.chain().focus().toggleHeading({ level: 3 }).run()">
              H3
            </button>
            <span class="w-px bg-gray-200 mx-1" />
            <button title="Liste à puces" :class="['toolbar-btn', editor.isActive('bulletList') ? 'toolbar-btn-active' : '']" @click="editor!.chain().focus().toggleBulletList().run()">
              — liste
            </button>
            <button title="Citation" :class="['toolbar-btn', editor.isActive('blockquote') ? 'toolbar-btn-active' : '']" @click="editor!.chain().focus().toggleBlockquote().run()">
              « »
            </button>
          </div>

          <div class="border border-gray-200 rounded-xl overflow-hidden focus-within:border-indigo-400 transition-colors min-h-[180px]">
            <EditorContent :editor="editor" />
          </div>
          <p class="text-xs text-gray-400 mt-2">Approche thérapeutique, accessibilité, langues parlées, délai d'attente estimé…</p>
        </div>

        <!-- Honeypot -->
        <input v-model="form.hp" type="text" name="email_confirm" autocomplete="off" aria-hidden="true" style="display:none" tabindex="-1" />

        <!-- RGPD + Actions -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <label class="flex items-start gap-3 cursor-pointer mb-6">
            <input v-model="form.consentement" type="checkbox" class="checkbox-custom mt-0.5 shrink-0" />
            <span class="text-sm text-gray-600">J'accepte que les informations soient utilisées pour alimenter l'annuaire TSA et qu'elles soient visibles publiquement. *</span>
          </label>
          <div class="flex justify-end gap-3">
            <NuxtLink to="/" class="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              Annuler
            </NuxtLink>
            <button :disabled="loading" class="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-700 disabled:opacity-50 transition-colors" @click="soumettre">
              {{ loading ? 'Envoi…' : 'Envoyer la suggestion →' }}
            </button>
          </div>
        </div>

      </div>
    </section>

  </div>
</template>

<style scoped>
/* Checkbox blanche, fiable sur tous mobiles */
.checkbox-custom {
  appearance: none;
  -webkit-appearance: none;
  width: 1rem;
  height: 1rem;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  background: #ffffff;
  cursor: pointer;
  flex-shrink: 0;
  position: relative;
  color-scheme: light;
}
.checkbox-custom:checked {
  background: #6366f1;
  border-color: #6366f1;
}
.checkbox-custom:checked::after {
  content: '';
  position: absolute;
  inset: 0;
  margin: auto;
  width: 5px;
  height: 9px;
  border: 2px solid white;
  border-top: none;
  border-left: none;
  transform: translateY(-1px) rotate(45deg);
}

/* Boutons toolbar TipTap */
.toolbar-btn {
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  font-size: 0.85rem;
  color: #6b7280;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.15s;
}
.toolbar-btn:hover { background: #f3f4f6; }
.toolbar-btn-active { background: #1f2937; color: #ffffff; }
.toolbar-btn-active:hover { background: #111827; }

/* Contenu éditeur TipTap */
.prose :deep(p) { margin: 0 0 0.5rem; }
.prose :deep(ul) { padding-left: 1.25rem; list-style: disc; }
.prose :deep(strong) { font-weight: 700; }
.prose :deep(em) { font-style: italic; }
.prose :deep(u) { text-decoration: underline; }
.prose :deep(h2) { font-size: 1.1rem; font-weight: 700; margin: 0.75rem 0 0.25rem; }
.prose :deep(h3) { font-size: 1rem; font-weight: 600; margin: 0.5rem 0 0.25rem; }
.prose :deep(blockquote) { border-left: 3px solid #d1d5db; padding-left: 0.75rem; color: #6b7280; font-style: italic; margin: 0.5rem 0; }
.prose :deep(a) { color: #6366f1; text-decoration: underline; }
</style>
