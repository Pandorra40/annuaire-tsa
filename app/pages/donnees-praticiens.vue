<script setup lang="ts">
useSeoMeta({
  title: 'Praticiens : vos données — Annuaire TSA',
  description: "Information des praticiens référencés dans l'Annuaire TSA au titre de l'article 14 du RGPD : origine des données, finalité, base légale, durée de conservation et exercice de vos droits."
})
</script>

<template>
  <div>

    <!-- EN-TÊTE -->
    <section class="relative overflow-hidden py-14" style="background: linear-gradient(160deg, #f8f4ff 0%, #f0f9ff 40%, #f0fdf4 70%, #fffbeb 100%)">
      <div class="absolute top-0 left-0 right-0 h-1" style="background: linear-gradient(90deg, #f87171, #fb923c, #fbbf24, #4ade80, #60a5fa, #a78bfa, #f472b6)" />
      <div class="relative max-w-3xl mx-auto px-6">
        <h1 class="text-4xl sm:text-5xl font-black text-gray-900 mb-3 tracking-tight">Praticiens : vos données</h1>
        <p class="text-gray-600 text-lg">
          Vous êtes référencé dans cet annuaire et vous n'avez rien demandé ?
          Cette page vous explique pourquoi, et ce que vous pouvez exiger.
        </p>
      </div>
    </section>

    <section class="bg-gray-50 py-12">
      <div class="max-w-3xl mx-auto px-6 space-y-6">

        <!-- RÉSUMÉ -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-7">
          <h2 class="font-black text-gray-900 text-xl mb-3">L'essentiel</h2>
          <p class="text-gray-600 leading-relaxed mb-4">
            L'Annuaire TSA recense des professionnels spécialisés dans les troubles du
            spectre de l'autisme, à partir d'informations <strong>déjà publiques</strong> :
            l'annuaire d'Autisme Info Service et les contributions de familles concernées.
          </p>
          <p class="text-gray-600 leading-relaxed">
            Votre fiche ne contient que des données professionnelles : celles que vous
            diffusez déjà pour être joignable. <strong>Vous pouvez à tout moment la faire
            corriger ou supprimer</strong>, sans avoir à vous justifier.
          </p>
          <!-- Au-dessus du bouton, et pas seulement dans le cadre en dessous : un lien
               mailto fait quitter la page, donc qui a cliqué ne lira jamais la suite. -->
          <p class="text-gray-600 leading-relaxed mt-4">
            Vous écrivez à une seule personne, bénévole.
          </p>
          <p class="mt-4">
            <a href="mailto:annuaire.tsa@gmail.com?subject=Ma%20fiche%20dans%20l%27Annuaire%20TSA" class="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-700 transition-colors">
              Demander une correction ou un retrait →
            </a>
          </p>
        </div>

        <!-- Sous le bouton, jamais au-dessus : il ne s'agit pas de dissuader
             d'écrire, mais de cadrer la façon d'écrire. -->
        <CadreBenevole />

        <!-- EN PRATIQUE — placé avant le juridique : c'est ce qu'un praticien vient
             chercher, et la plupart n'ont pas besoin de lire la suite. -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-7">
          <h2 class="font-black text-gray-900 text-xl mb-1">Votre fiche, en pratique</h2>
          <p class="text-gray-500 mb-6">Trois situations, trois réponses courtes.</p>

          <div class="space-y-5">
            <div class="flex gap-4">
              <div class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center shrink-0">1</div>
              <div>
                <h3 class="font-bold text-gray-900 mb-1">Une information est fausse</h3>
                <p class="text-gray-600 leading-relaxed">
                  Sur votre fiche, cliquez sur <strong>« Corriger mes informations »</strong>.
                  Dites ce qui doit changer et ce qu'il faut mettre à la place, c'est tout.
                  Corrigé sous quelques jours.
                </p>
              </div>
            </div>

            <div class="flex gap-4">
              <div class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center shrink-0">2</div>
              <div>
                <h3 class="font-bold text-gray-900 mb-1">Vous ne voulez plus y figurer</h3>
                <p class="text-gray-600 leading-relaxed">
                  Même endroit, bouton <strong>« Retirer ma fiche »</strong>.
                  Vous n'avez pas à vous justifier, et votre demande ne sera jamais discutée.
                </p>
              </div>
            </div>

            <div class="flex gap-4">
              <div class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center shrink-0">3</div>
              <div>
                <h3 class="font-bold text-gray-900 mb-1">Le formulaire de contact vous encombre</h3>
                <p class="text-gray-600 leading-relaxed">
                  Il n'existe que si vous avez dit oui par écrit. Chaque message que vous
                  recevez porte un <strong>lien de désactivation</strong> : un clic, et il
                  disparaît de votre fiche. Immédiat, sans nous écrire.
                </p>
              </div>
            </div>
          </div>

          <p class="text-gray-500 text-sm mt-6 pt-5 border-t border-gray-100">
            Vous préférez écrire ?
            <a href="mailto:annuaire.tsa@gmail.com?subject=Ma%20fiche%20dans%20l%27Annuaire%20TSA" class="text-indigo-600 hover:text-indigo-700 font-medium">annuaire.tsa@gmail.com</a>
            — une seule adresse, pour tout.
          </p>
        </div>

        <!-- SÉPARATEUR : signale au praticien qu'il peut s'arrêter là -->
        <div class="pt-6 pb-1 text-center">
          <p class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Le cadre juridique</p>
          <p class="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
            Ce qui suit détaille vos droits et leur fondement. Vous n'avez pas besoin de
            le lire pour faire corriger ou retirer votre fiche.
          </p>
        </div>

        <!-- POURQUOI CETTE PAGE -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-7">
          <h2 class="font-black text-gray-900 text-xl mb-3">Pourquoi cette page existe</h2>
          <p class="text-gray-600 leading-relaxed">
            Le RGPD impose d'informer toute personne dont les données sont collectées
            indirectement, c'est-à-dire sans qu'elle les ait fournies elle-même
            <span class="text-gray-500">(article 14)</span>.
          </p>
          <p class="text-gray-600 leading-relaxed mt-3">
            Les praticiens dont l'adresse électronique a pu être retrouvée ont reçu cette
            information par courriel. Pour les autres, aucune adresse fiable n'était
            disponible : les contacter individuellement supposerait des recherches
            nominatives puis des courriers postaux, hors de portée d'un projet bénévole.
            Le même article prévoit ce cas et autorise alors une information publique —
            c'est l'objet de cette page.
          </p>
        </div>

        <!-- RESPONSABLE -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-7">
          <h2 class="font-black text-gray-900 text-xl mb-3">Qui traite ces données</h2>
          <p class="text-gray-600 leading-relaxed">
            <strong>M. Husic</strong>, éditeur du site annuaire-tsa.fr à titre bénévole
            <span class="text-gray-500">(également identifié sous le pseudonyme Pandorra40 sur le dépôt public du projet)</span>.
          </p>
          <p class="text-gray-600 leading-relaxed mt-3">
            Contact : <a href="mailto:annuaire.tsa@gmail.com" class="text-indigo-600 hover:text-indigo-700 font-medium">annuaire.tsa@gmail.com</a><br>
            <span class="text-gray-500">Identité complète communiquée sur demande à toute personne concernée ou à la CNIL.</span>
          </p>
          <p class="text-gray-600 leading-relaxed mt-3">
            Il n'y a ni société, ni association, ni modèle économique derrière ce site :
            aucune publicité, aucun traceur commercial, aucune revente de données.
          </p>
        </div>

        <!-- ORIGINE -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-7">
          <h2 class="font-black text-gray-900 text-xl mb-3">D'où viennent les données</h2>
          <ul class="text-gray-600 leading-relaxed space-y-2 list-disc pl-5">
            <li>
              L'annuaire public d'<a href="https://www.autisme-infoservice.fr" target="_blank" rel="noopener" class="text-indigo-600 hover:text-indigo-700 font-medium">Autisme Info Service</a>,
              service national d'information sur l'autisme, dont les données sont diffusées
              sous licence Apache 2.0.
            </li>
            <li>
              Des suggestions envoyées par des familles ou des professionnels via le
              formulaire du site, vérifiées avant publication.
            </li>
          </ul>
        </div>

        <!-- DONNÉES -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-7">
          <h2 class="font-black text-gray-900 text-xl mb-3">Ce qui figure sur votre fiche</h2>
          <p class="text-gray-600 leading-relaxed">
            Nom, profession, ville et département, adresse professionnelle, téléphone,
            site web ou page de prise de rendez-vous, public reçu, délai d'attente
            indicatif, pratique de la téléconsultation, numéro ADELI ou RPPS lorsqu'il est
            public.
          </p>
          <p class="text-gray-600 leading-relaxed mt-3">
            <strong>Aucune donnée personnelle au sens strict</strong> — pas d'adresse
            privée, pas de date de naissance, pas d'information sur votre vie personnelle.
          </p>
          <p class="text-gray-600 leading-relaxed mt-3">
            Si votre adresse électronique nous est connue, elle sert uniquement à vous
            écrire au sujet de votre fiche. <strong>Elle n'est jamais publiée</strong>, ni
            affichée sur le site, ni accessible depuis son interface de programmation
            publique.
          </p>
          <p class="text-gray-600 leading-relaxed mt-3">
            Seule exception : si vous nous demandez vous-même de faire figurer une adresse
            de contact sur votre fiche, elle y apparaît alors publiquement, c'est votre
            choix, jamais le nôtre.
          </p>
        </div>

        <!-- FINALITÉ ET BASE LÉGALE -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-7">
          <h2 class="font-black text-gray-900 text-xl mb-3">Pourquoi, et à quel titre</h2>
          <p class="text-gray-600 leading-relaxed">
            <strong>Finalité :</strong> permettre aux personnes autistes et à leurs proches
            de trouver un professionnel spécialisé près de chez elles. L'offre existe mais
            reste dispersée ; les familles perdent souvent des mois à la chercher.
          </p>
          <p class="text-gray-600 leading-relaxed mt-3">
            <strong>Base légale :</strong> l'intérêt légitime
            <span class="text-gray-500">(article 6.1.f)</span>. Les données traitées sont
            professionnelles et déjà publiques, le traitement se borne à les rendre plus
            faciles à trouver, et vous conservez à tout moment le droit de vous y opposer.
          </p>
          <p class="text-gray-600 leading-relaxed mt-3">
            Lorsqu'un formulaire de contact est activé sur une fiche, il repose sur le
            <strong>consentement explicite</strong> du praticien
            <span class="text-gray-500">(article 6.1.a)</span>, recueilli par écrit et
            révocable à tout moment.
          </p>
        </div>

        <!-- FORMULAIRE DE CONTACT -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-7">
          <h2 class="font-black text-gray-900 text-xl mb-3">Le formulaire de contact</h2>
          <p class="text-gray-600 leading-relaxed">
            Beaucoup de personnes autistes ne peuvent pas passer d'appel téléphonique. Un
            formulaire peut donc être activé sur votre fiche, <strong>uniquement si vous
            l'avez accepté par écrit</strong>. Sans accord de votre part, il n'y en a pas.
          </p>
          <p class="text-gray-600 leading-relaxed mt-3">
            Concrètement : un visiteur écrit depuis votre fiche, vous recevez son message
            par courriel, et vous lui répondez depuis votre messagerie. Sa réponse ne passe
            pas par le site. <strong>Votre adresse n'est jamais affichée</strong> et reste
            invisible pour les visiteurs comme pour les robots d'aspiration.
          </p>
          <ul class="text-gray-600 leading-relaxed space-y-2 list-disc pl-5 mt-3">
            <li>
              <strong>Le contenu des messages n'est conservé nulle part.</strong> Ni dans la
              base du site, ni dans la boîte de l'éditeur, qui n'en reçoit aucune copie et ne
              les lit donc jamais. Seules la date, la fiche concernée et l'adresse de
              l'expéditeur sont journalisées.
            </li>
            <li>
              Si vous receviez un message abusif, signalez-le : votre formulaire sera coupé
              et l'expéditeur bloqué. Le contenu ne pourra pas être vérifié, votre parole
              suffira.
            </li>
            <li>
              <strong>Chaque message contient un lien de désactivation.</strong> Un clic
              coupe le formulaire immédiatement, sans avoir à écrire à qui que ce soit
              <span class="text-gray-500">(article 7.3)</span>.
            </li>
          </ul>
        </div>

        <!-- DESTINATAIRES -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-7">
          <h2 class="font-black text-gray-900 text-xl mb-3">Qui y a accès</h2>
          <p class="text-gray-600 leading-relaxed">
            Les informations de votre fiche sont publiques : elles sont visibles par les
            visiteurs du site et indexées par les moteurs de recherche. C'est le principe
            même d'un annuaire.
          </p>
          <p class="text-gray-600 leading-relaxed mt-3">
            Elles ne sont ni vendues, ni cédées, ni transmises à des fins commerciales.
            Interviennent seulement les prestataires techniques nécessaires au
            fonctionnement du service :
          </p>
          <ul class="text-gray-600 leading-relaxed space-y-2 list-disc pl-5 mt-3">
            <li><strong>LWS</strong> — hébergement du site et de la base, en France.</li>
            <li><strong>Google</strong> — acheminement des courriels envoyés depuis l'adresse du projet.</li>
            <li><strong>Mailmeteor</strong> — outil de publipostage utilisé pour l'envoi d'information aux praticiens.</li>
          </ul>
        </div>

        <!-- CONSERVATION -->
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-7">
          <h2 class="font-black text-gray-900 text-xl mb-3">Combien de temps</h2>
          <p class="text-gray-600 leading-relaxed">
            Votre fiche est conservée tant qu'elle est publiée et que les informations
            restent exactes. Elle est supprimée sur demande, dans les meilleurs délais et
            au plus tard sous un mois. Elle l'est également lorsqu'il apparaît que vous
            avez cessé votre activité.
          </p>
          <p class="text-gray-600 leading-relaxed mt-3">
            Une adresse électronique dont il apparaît qu'elle n'est plus valide est
            effacée sans délai.
          </p>
        </div>

        <!-- DROITS -->
        <div class="bg-white rounded-2xl border border-indigo-200 shadow-sm p-7">
          <h2 class="font-black text-gray-900 text-xl mb-3">Vos droits</h2>
          <p class="text-gray-600 leading-relaxed">
            Vous disposez des droits d'accès, de rectification, d'effacement,
            d'opposition, de limitation et de portabilité.
          </p>
          <p class="text-gray-600 leading-relaxed mt-3">
            <strong>Le droit d'opposition</strong>
            <span class="text-gray-500">(article 21)</span> mérite une précision, car il
            est celui qui vous concerne le plus directement : vous pouvez vous opposer à
            figurer dans cet annuaire <strong>sans avoir à motiver votre demande</strong>.
            Elle ne sera jamais contestée ni discutée, et vaut retrait de votre fiche.
          </p>
          <p class="text-gray-600 leading-relaxed mt-3">
            Une seule adresse pour les exercer :
            <a href="mailto:annuaire.tsa@gmail.com" class="text-indigo-600 hover:text-indigo-700 font-medium">annuaire.tsa@gmail.com</a>.
            Réponse dans les meilleurs délais, et au plus tard sous un mois. Aucun
            justificatif ne vous sera demandé pour une correction ou un retrait.
          </p>
          <p class="text-gray-600 leading-relaxed mt-3">
            Si la réponse ne vous satisfait pas, vous pouvez saisir la
            <a href="https://www.cnil.fr" target="_blank" rel="noopener" class="text-indigo-600 hover:text-indigo-700 font-medium">CNIL</a>.
          </p>
        </div>

        <p class="text-sm text-gray-500 text-center pt-2">
          Voir aussi les <NuxtLink to="/mentions" class="text-gray-500 hover:text-gray-900 underline">mentions légales</NuxtLink>.
        </p>

      </div>
    </section>

  </div>
</template>
