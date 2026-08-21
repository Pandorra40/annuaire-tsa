<!--
  Adresse à laquelle répondre à l'auteur d'une contribution — signalement ou
  suggestion.

  Aucun des quatre formulaires n'en collectait. Un signalement incomplet était
  donc une impasse : impossible de demander ce qui manquait. Une suggestion
  refusée l'était en silence, sans que son auteur puisse savoir pourquoi.

  Facultatif, et il doit le rester : un visiteur doit pouvoir signaler une
  erreur sans se nommer, et l'exiger reviendrait à filtrer les contributions
  par la disposition à se déclarer.

  La raison est affichée à côté du champ plutôt que sous-entendue. Un champ
  e-mail facultatif sans justification se lit comme une collecte de plus, et
  personne ne le remplit ; dire ce qu'on ne pourra pas faire sans lui change la
  décision. Le même argument formulé à la première personne — « je ne peux pas
  vous demander » — parce que le lecteur écrit bien à une personne, comme le
  rappelle déjà CadreBenevole.

  Composant partagé plutôt que quatre copies : le texte de justification est la
  partie qui compte, et il ne doit pas diverger d'un formulaire à l'autre.
-->
<script setup lang="ts">
defineProps<{
  /** Ce qui ne pourra pas aboutir sans adresse, au singulier et sans article. */
  sujet: string
  /**
   * Numéro d'étape, sur les formulaires qui en numérotent. Omis ailleurs :
   * ce composant sert aussi le signalement et les suggestions d'association
   * et de livre, qui n'ont pas de parcours numéroté — y afficher un « 6 »
   * isolé ne renverrait à rien.
   */
  etape?: number
}>()

const modele = defineModel<string>({ required: true })
</script>

<template>
  <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
    <h2 class="font-bold text-gray-900 text-lg mb-5 flex items-center gap-3 pb-4 border-b border-gray-100">
      <span v-if="etape" class="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm shrink-0" aria-hidden="true">{{ etape }}</span>
      <span v-else class="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-base" aria-hidden="true">✉️</span>
      Comment vous répondre
      <span class="ml-auto text-xs text-gray-500 font-normal">Optionnel</span>
    </h2>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
      <div>
        <label for="contact-auteur" class="block text-sm font-semibold text-gray-700 mb-1.5">
          Votre adresse électronique
        </label>
        <input
          id="contact-auteur"
          v-model="modele"
          type="email"
          autocomplete="email"
          placeholder="vous@exemple.fr"
          aria-describedby="contact-auteur-aide"
          class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-gray-50 text-gray-900 transition-all"
        >
      </div>
      <p id="contact-auteur-aide" class="text-sm text-gray-600 leading-relaxed bg-gray-50 border-l-4 border-l-indigo-400 rounded-r-xl px-4 py-3">
        Sans adresse, si {{ sujet }} ne peut pas aboutir, vous ne saurez pas pourquoi
        et je ne peux pas vous demander l'information manquante. Elle sert
        uniquement à cet échange et n'est jamais publiée.
      </p>
    </div>
  </div>
</template>
