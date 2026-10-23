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
            Architecture en deux niveaux :<br><br>
            <strong>Porte d’entrée (VPS)</strong> — <strong>Infomaniak Network SA</strong><br>
            Rue Eugène-Marziano 25, 1227 Les Acacias (GE), Suisse<br>
            IDE/TVA : CHE-103.167.648<br>
            Nginx reverse proxy (façade publique du site).<br><br>
            <strong>Application et base de données</strong> — auto-hébergées
            par l’éditeur sur son serveur (<strong>T330 / Hébernet</strong>),
            qui n’est pas un prestataire d’hébergement tiers.
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
            Pour toute demande (modification, suppression) :
            <a href="mailto:annuaire.tsa@gmail.com" class="text-indigo-600 hover:underline">annuaire.tsa@gmail.com</a>
          </p>
          <ul class="text-sm text-gray-600 leading-relaxed space-y-2 list-disc pl-5 mt-3">
            <li>
              <strong>Suggestions et signalements :</strong> conservés le temps de la
              modération, puis publiés (si validés) ou supprimés.
            </li>
            <li>
              <strong>Formulaire de contact d'une fiche :</strong> le message est transmis
              au praticien par courriel ; son contenu n'est stocké nulle part. Seules la
              date, la fiche, l'adresse de l'expéditeur et l'IP sont journalisées pour
              limiter les abus, puis <strong>effacées automatiquement au-delà de 12 mois</strong>.
            </li>
            <li>
              <strong>Statistiques de visite :</strong> compteurs agrégés par jour et par
              page, sans profil nominatif. Conservés <strong>24 mois</strong>, puis purgés.
              Les IP volontairement exclues des stats le restent jusqu'à retrait manuel.
            </li>
            <li>
              <strong>Connexions à l'administration :</strong> journal des tentatives
              (réussies ou non) pour la sécurité, purgé au-delà de <strong>12 mois</strong>.
            </li>
          </ul>
          <p class="text-sm text-gray-600 leading-relaxed mt-3">
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
            <a href="https://www.autismeinfoservice.fr" target="_blank" rel="noopener" class="text-indigo-600 hover:underline">Autisme et TND Info Service</a>.
            Leur site indique que le contenu est protégé (tous droits réservés) et qu'une
            réutilisation à des fins d'information non commerciale est possible avec citation
            de la source — ce n'est pas une licence Apache 2.0. Les données ont été filtrées
            et adaptées au format de cet annuaire. Les autres fiches sont issues de
            contributions communautaires.
          </p>
        </div>

      </div>
    </section>
  </div>
</template>
