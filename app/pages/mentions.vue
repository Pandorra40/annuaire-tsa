<script setup lang="ts">
useSeoMeta({
  title: 'Mentions légales — Annuaire TSA'
})
</script>

<template>
  <div>
    <!-- EN-TÊTE -->
    <section class="relative overflow-hidden py-16" style="background: linear-gradient(160deg, #f8f4ff 0%, #f0f9ff 40%, #f0fdf4 70%, #fffbeb 100%)">
      <div class="absolute top-0 left-0 right-0 h-1" style="background: linear-gradient(90deg, #f87171, #fb923c, #fbbf24, #4ade80, #60a5fa, #a78bfa, #f472b6)" />
      <div class="relative max-w-3xl mx-auto px-6 text-center">
        <h1 class="text-4xl sm:text-5xl font-black text-gray-900 mb-3 tracking-tight">Mentions légales</h1>
        <p class="text-gray-500 text-lg">Informations légales sur l'éditeur et l'hébergement du site.</p>
      </div>
    </section>

    <section class="bg-gray-50 py-12 min-h-screen">
      <div class="max-w-3xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 gap-5">

        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div class="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center mb-4 text-base">👤</div>
          <h2 class="font-bold text-gray-900 mb-2">Éditeur du site</h2>
          <p class="text-sm text-gray-600 leading-relaxed">
            Site édité à titre bénévole par<br><strong>Pandorra40</strong><br>
            <a href="mailto:annuaire.tsa@gmail.com" class="text-indigo-600 hover:underline">annuaire.tsa@gmail.com</a>
          </p>
        </div>

        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div class="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center mb-4 text-base">🖥️</div>
          <h2 class="font-bold text-gray-900 mb-2">Hébergement</h2>
          <p class="text-sm text-gray-600 leading-relaxed">
            Hébergé par <strong>LWS</strong><br>
            2 rue Jules Ferry, 88190 Golbey, France<br>
            Données stockées en France
          </p>
        </div>

        <!-- Le pseudonyme suffit pour l'éditeur (LCEN art. 6-III, éditeur non
             professionnel), mais le RGPD exige d'identifier le responsable du
             traitement : c'est le seul endroit où le nom civil apparaît. -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div class="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center mb-4 text-base">⚖️</div>
          <h2 class="font-bold text-gray-900 mb-2">Responsable du traitement</h2>
          <p class="text-sm text-gray-600 leading-relaxed">
            <strong>M. Husic</strong><br>
            <a href="mailto:annuaire.tsa@gmail.com" class="text-indigo-600 hover:underline">annuaire.tsa@gmail.com</a><br>
            <span class="text-gray-500">
              Identité complète communiquée sur demande à toute personne concernée
              ou à la CNIL.
            </span>
          </p>
          <p class="text-sm text-gray-600 leading-relaxed mt-3">
            Vous disposez d'un droit d'accès, de rectification, d'effacement,
            d'opposition, de limitation et de portabilité. Réponse sous un mois
            maximum. Réclamation possible auprès de la
            <a href="https://www.cnil.fr" target="_blank" rel="noopener" class="text-indigo-600 hover:underline">CNIL</a>.
          </p>
        </div>

        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div class="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center mb-4 text-base">🛡️</div>
          <h2 class="font-bold text-gray-900 mb-2">Données personnelles</h2>
          <p class="text-sm text-gray-600 leading-relaxed">
            Aucune inscription requise. Aucun cookie publicitaire ni tracking.
            Les suggestions et signalements peuvent contenir du texte libre : conservés le temps
            de la modération, puis publiés ou supprimés.
            Pour toute demande (modification, suppression) :
            <a href="mailto:annuaire.tsa@gmail.com" class="text-indigo-600 hover:underline">annuaire.tsa@gmail.com</a>
            <br><br>
            <strong>Formulaire de contact d'une fiche :</strong> votre message est transmis
            au praticien par courriel, avec votre adresse en « répondre à » pour qu'il vous
            réponde directement. Son contenu n'est conservé nulle part : ni dans la base du
            site, ni par son éditeur, qui n'en reçoit aucune copie. Seules la date, la fiche
            concernée et votre adresse sont journalisées, pour pouvoir limiter les abus.
            <br><br>
            Vous êtes un praticien référencé ?
            <NuxtLink to="/donnees-praticiens" class="text-indigo-600 hover:underline">Information dédiée sur vos données →</NuxtLink>
          </p>
        </div>

        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div class="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center mb-4 text-base">💻</div>
          <h2 class="font-bold text-gray-900 mb-2">Code source</h2>
          <p class="text-sm text-gray-600 leading-relaxed">
            Projet open source sous licence <strong>AGPL-3.0</strong>.<br>
            <a href="https://github.com/Pandorra40/annuaire-tsa" target="_blank" rel="noopener" class="text-indigo-600 hover:underline">Code sur GitHub →</a>
          </p>
        </div>

        <div class="sm:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div class="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center mb-4 text-base">🗄️</div>
          <h2 class="font-bold text-gray-900 mb-2">Sources des données</h2>
          <p class="text-sm text-gray-600 leading-relaxed">
            Une partie des fiches praticiens provient de l'annuaire
            <a href="https://www.autisme-infoservice.fr" target="_blank" rel="noopener" class="text-indigo-600 hover:underline">Autisme Info Service</a>,
            publiées sous licence <strong>Apache 2.0</strong>. Les données ont été filtrées et adaptées au format de cet annuaire.
            Les autres fiches sont issues de contributions communautaires.
          </p>
        </div>

      </div>
    </section>
  </div>
</template>
