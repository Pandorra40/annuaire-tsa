<!--
  Affichage, côté administration, de l'adresse laissée par l'auteur d'une
  contribution.

  Collecter un moyen de réponse sans le montrer ne servirait à rien : c'est ici
  que la colonne contact_auteur prend son sens. Le lien mailto porte déjà
  l'objet, pour que répondre à un signalement flou soit un clic et non une
  rédaction d'en-tête.

  L'absence d'adresse est affichée, et pas seulement sa présence : savoir qu'on
  ne pourra pas obtenir de précision change la façon de traiter une
  contribution incomplète — on tranche au lieu d'attendre.
-->
<script setup lang="ts">
const props = defineProps<{
  contact?: string | null
  /** Objet du courriel, sans le préfixe du site. */
  objet: string
}>()

const lien = computed(() =>
  `mailto:${props.contact}?subject=${encodeURIComponent(`Annuaire TSA — ${props.objet}`)}`
)
</script>

<template>
  <p v-if="contact" class="text-sm mt-2">
    <a :href="lien" class="text-blue-700 hover:text-blue-800 font-medium underline underline-offset-2">
      ✉️ {{ contact }}
    </a>
  </p>
  <p v-else class="text-xs text-gray-500 mt-2 italic">
    Aucune adresse laissée — impossible de demander une précision.
  </p>
</template>
