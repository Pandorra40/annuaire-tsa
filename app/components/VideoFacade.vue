<script setup lang="ts">
// Le lecteur n'est créé qu'après un clic explicite. Tant que la vignette est là,
// aucune requête ne part vers Google : le courriel envoyé aux praticiens promet
// « ni publicité ni traceur commercial », et une iframe chargée avec la page
// livrerait l'adresse IP de chaque visiteur, y compris de ceux qui ne regardent rien.
//
// La vignette est dessinée en dégradé plutôt que tirée de i.ytimg.com, ce qui
// évite d'élargir img-src dans la CSP — et de contacter Google pour une image.
const props = defineProps<{
  youtubeId: string
  titre: string
  duree?: string | null
}>()

const charge = ref(false)

// Trois dégradés, choisis d'après l'identifiant : deux cartes voisines ne se
// ressemblent pas, et une même vidéo garde son aspect d'une visite à l'autre.
const fonds = [
  'linear-gradient(135deg, #6366f1 0%, #8b5cf6 55%, #d946ef 100%)',
  'linear-gradient(135deg, #0ea5e9 0%, #6366f1 60%, #a855f7 100%)',
  'linear-gradient(135deg, #10b981 0%, #0ea5e9 60%, #6366f1 100%)'
]
const fond = computed(() => {
  let somme = 0
  for (const c of props.youtubeId) somme += c.charCodeAt(0)
  return fonds[somme % fonds.length]
})

const src = computed(() =>
  `https://www.youtube-nocookie.com/embed/${props.youtubeId}?autoplay=1&rel=0`
)
</script>

<template>
  <div class="relative w-full aspect-video bg-black">
    <button
      v-if="!charge"
      type="button"
      class="group relative w-full h-full block text-left"
      :style="{ background: fond }"
      :aria-label="`Charger et lire : ${titre} — cette action contacte YouTube`"
      @click="charge = true"
    >
      <span class="absolute inset-0 pointer-events-none" style="background: radial-gradient(ellipse at 50% 45%, rgba(255,255,255,0.16) 0%, transparent 60%)" />
      <span class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-xl transition-transform group-hover:scale-110">
        <svg class="w-7 h-7 ml-1 text-gray-900" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
      </span>
      <span v-if="duree" class="absolute right-3 bottom-3 px-2 py-0.5 rounded-md bg-black/60 text-white text-xs font-semibold">
        {{ duree }}
      </span>
    </button>

    <iframe
      v-else
      :src="src"
      :title="titre"
      class="w-full h-full"
      loading="lazy"
      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
      referrerpolicy="strict-origin-when-cross-origin"
      allowfullscreen
    />
  </div>
</template>
