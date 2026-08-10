# Annuaire TSA — V4.7

Projet open source communautaire pour les familles concernées par les troubles du spectre autistique (TSA).

## Ce que contient le projet

### 1. Annuaire TSA
Annuaire collaboratif et gratuit de praticiens spécialisés TSA : psychiatres, pédopsychiatres, psychologues, neuropsychologues, orthophonistes, ergothérapeutes et psychomotriciens, ainsi que les structures (cabinets, instituts, centres) qui ne désignent pas une personne.

- Recherche par ville, département ou spécialité
- Filtres par type de praticien, tranche d'âge et mode de consultation
- Système de confirmation et signalement communautaire
- Formulaire de contact par praticien, pour les personnes qui ne peuvent pas téléphoner — activé uniquement avec l'accord écrit du praticien, son adresse n'est jamais publiée
- Suggestion de praticiens par la communauté
- Pages dédiées par département (`/departement/XX`) pour le SEO
- Pagination (20 praticiens par page) — page et filtres conservés dans l'URL (recherches partageables, état restauré au retour navigateur)
- Identifiant national affiché sur les fiches, intitulé d'après le type de fiche et le format du numéro : « N° RPPS » à 11 chiffres, « N° ADELI » à 9 (les psychologues ont basculé vers le RPPS le 3 juin 2024), et pour une structure « N° SIRET » à 14 ou « N° FINESS » à 9 — un FINESS ayant la même longueur qu'un ADELI, la longueur seule ne suffit pas à trancher
- Partage sur Facebook + copie du lien sur chaque fiche praticien
- **Critère d'admission** : un praticien ne figure dans l'annuaire que si son identifiant est vérifié au répertoire national des professionnels de santé (RPPS, ou ADELI le temps de la bascule). Une structure — cabinet, centre, institut — n'est pas une personne physique et n'a pas de RPPS : SIRET ou FINESS y sont acceptés sans être exigés. Le critère est écrit sur `/suggerer` et sur `/donnees-praticiens`
- Données issues d'Autisme Info Service et de Tamis-Autisme, enrichies manuellement

### 2. Associations TSA (`/associations/`)
Annuaire de 290 associations spécialisées dans les troubles du spectre autistique en France.

- Associations de familles, de personnes concernées et de professionnels
- Recherche par nom, ville, département ou service
- Informations de contact : téléphone, email, site web
- Services proposés, public concerné, description
- Formulaire de suggestion public (`/associations/suggerer`) et modération dans `/admin/associations`
- Données issues d'Autisme Info Service (licence Apache 2.0)

### 3. Ressources (`/ressources/`)
Deux rubriques de même niveau, réunies sous une entrée de menu commune : le livre et
la vidéo se complètent, ils ne se hiérarchisent pas.

#### Livres TSA (`/ressources/livres/`)
Sélection collaborative de livres sur le TSA.

- **Grands classiques** — sélection éditoriale stockée en base de données
- **Dernières parutions** — mises à jour automatiquement via data.bnf.fr / BnF (SPARQL, sans clé API)
- Formulaire de suggestion de livres sans inscription

#### Vidéos TSA (`/ressources/videos/`)
Chaînes YouTube et vidéos choisies une par une, classées par position d'énonciation —
professionnels, personnes concernées, familles et proches — et non par thème.

- **Façade au clic** : le lecteur `youtube-nocookie` n'est créé qu'après un clic
  explicite. Avant, aucune requête ne part vers Google, et les vignettes sont des
  dégradés dessinés localement — `img-src` de la CSP reste inchangé
- **Les chaînes ne sont pas intégrées mais liées** : recommander une chaîne n'est pas
  recommander sa dernière vidéo. Carte sobre et lien sortant, sans lecteur
- Chaque entrée porte une ligne « Pourquoi ici », obligatoire : c'est elle qui
  distingue la rubrique d'une liste de liens
- L'administrateur colle une adresse, le serveur reconnaît une vidéo ou une chaîne et
  refuse le reste. Le `?si=…` des liens de partage, marqueur de provenance, est retiré

### 4. Centres Ressources Autisme (`/cra/`)
Les 47 centres ressources publics de France, avec le parcours de diagnostic expliqué.

- 28 Centres Ressources Autisme régionaux, 16 centres IntimAgir, 2 centres spécialisés et le GNCRA
- Recherche par nom, région, ville ou département, filtrable par catégorie
- Regroupement par région, coordonnées complètes (adresse, téléphone, email, site)
- Le parcours de repérage et de diagnostic en trois niveaux, selon la Stratégie nationale pour l'autisme
- Données institutionnelles publiques (GNCRA / Autisme Info Service) — **stockées en dur dans `app/data/cra.ts`, pas en base** : ces structures sont stables et ne se modifient pas depuis l'admin

## Stack technique

| Composant | Technologie |
|---|---|
| Frontend | Nuxt 4 + Vue 3 + Nuxt UI + Tailwind CSS |
| Backend | PHP 8.4 |
| Base de données | MySQL |
| Hébergement | LWS (serveur mutualisé) |
| API externe | data.bnf.fr / BnF — SPARQL (nouveautés livres) |
| Éditeur rich text | Tiptap |
| Typage | TypeScript |
| SEO | Bing Webmaster Tools + IndexNow + @nuxtjs/sitemap |
| PWA | @vite-pwa/nuxt — installable sur mobile |

## Accessibilité

- **A- / A+** — taille de police réglable (4 niveaux)
- **Mode lecture** — police OpenDyslexic, espacement augmenté, animations réduites
- **Contraste élevé** — noir pur sur blanc pur pour les malvoyants
- **Dark mode** — thème sombre selon les préférences système ou manuel
- Disponible sur desktop (navbar) et mobile (menu hamburger)
- `prefers-reduced-motion` respecté automatiquement

## Structure des fichiers

```
annuaire-tsa-nuxt/
├── app/
│   ├── app.vue                  # Point d'entrée avec NuxtLayout
│   ├── app.config.ts            # Configuration Nuxt UI
│   ├── error.vue                # Page d'erreur (404 et erreurs inattendues)
│   ├── assets/css/main.css      # Styles globaux + accessibilité
│   ├── layouts/
│   │   ├── default.vue          # Layout public (navbar + footer)
│   │   └── admin.vue            # Layout admin isolé
│   ├── components/
│   │   ├── CadreBenevole.vue    # Cadre de bonne conduite, sous les liens mailto
│   │   ├── RessourcesOnglets.vue # Onglets Livres / Vidéos
│   │   └── VideoFacade.vue      # Lecteur YouTube chargé au clic, jamais avant
│   ├── composables/
│   │   └── useApi.ts            # Appels API centralisés
│   ├── data/
│   │   ├── cra.ts               # Centres Ressources Autisme (données statiques, hors BDD)
│   │   └── finances.ts          # Coûts du site (données statiques, hors BDD)
│   ├── types/
│   │   └── index.ts             # Types TypeScript
│   ├── utils/
│   │   └── meta.ts              # Échappe les esperluettes des balises meta (unhead ne le fait pas)
│   └── pages/
│       ├── index.vue            # Page d'accueil annuaire
│       ├── praticien/[id].vue   # Fiche détaillée praticien
│       ├── departement/[num].vue # Praticiens par département
│       ├── suggerer.vue         # Formulaire suggestion praticien
│       ├── signaler.vue         # Signaler une erreur
│       ├── associations/
│       │   ├── index.vue        # Annuaire associations TSA
│       │   └── suggerer.vue     # Formulaire suggestion association
│       ├── association/[id].vue # Fiche détaillée association
│       ├── cra.vue              # Centres Ressources Autisme + parcours de diagnostic
│       ├── ressources/
│       │   ├── index.vue        # Redirige vers /ressources/livres
│       │   ├── livres/
│       │   │   ├── index.vue    # Page livres TSA
│       │   │   └── suggerer.vue # Formulaire suggestion livre
│       │   └── videos/
│       │       └── index.vue    # Chaînes et vidéos YouTube
│       ├── apropos.vue
│       ├── contact.vue
│       ├── mentions.vue
│       ├── donnees-praticiens.vue # Information RGPD dédiée aux praticiens
│       ├── couts.vue            # Transparence sur les frais du site (sans appel aux dons)
│       └── admin/
│           ├── login.vue        # Connexion admin
│           ├── index.vue        # Dashboard admin praticiens
│           ├── modifier.vue     # Modifier une fiche praticien
│           ├── contacts.vue     # Emails et consentements des formulaires
│           ├── livres.vue       # Admin livres TSA
│           ├── videos.vue       # Admin vidéos et chaînes
│           └── associations.vue # Modération des suggestions d'associations

api/                             # API PHP (à déployer sur LWS)
├── config.php                   # Connexion BDD + fonctions communes
├── auth.php                     # Authentification admin
├── praticiens.php               # CRUD praticiens (public)
├── contact.php                  # Formulaire de contact + lien de désactivation
├── vendor/                      # PHPMailer installé par composer en local, transféré tel quel
├── migrations/                  # Scripts SQL, appliqués via phpMyAdmin
├── associations.php             # Lecture associations (public)
├── admin_praticiens.php         # Gestion admin praticiens
├── suggestions.php              # Suggestions de praticiens
├── signalements.php             # Signalements
├── livres.php                   # CRUD livres
├── videos.php                   # CRUD vidéos et chaînes + validation des adresses
├── suggestions_livres.php       # Suggestions de livres
├── suggestions_associations.php # Suggestions d'associations + modération
└── bnf-proxy.php                # Proxy PHP vers data.bnf.fr (SPARQL)
```

## Base de données

### Tables annuaire
- `praticiens` — fiches praticiens publiées
- `suggestions` — suggestions de praticiens en attente de validation
- `signalements` — signalements d'erreurs sur les fiches
- `admin_sessions` — sessions administrateur
- `praticiens_contact` — email, consentement et jeton de désactivation du formulaire de contact. Table **séparée** de `praticiens` : `praticiens.php` fait `SELECT *` et publierait l'adresse
- `contact_journal` — métadonnées des messages envoyés (date, fiche, IP, adresse de l'expéditeur). **Jamais le contenu des messages**, et purgé au-delà de douze mois, au fil des envois

### Tables associations
- `associations` — associations TSA publiées (source AIS Apache 2.0)
- `suggestions_associations` — suggestions envoyées depuis le site, en attente de modération

### Tables ressources
- `livres` — livres publiés (classiques + suggestions validées)
- `suggestions_livres` — suggestions de livres en attente de validation
- `videos` — vidéos et chaînes recommandées. `type` distingue les deux : une vidéo
  porte un `youtube_id` de 11 caractères, une chaîne une `url` normalisée

## Développement local

```bash
pnpm install
pnpm dev
```

Le site sera accessible sur `http://localhost:3000`.

> **Note** : Les données sont chargées côté client (`server: false`) et viennent de l'API de production. `allowedOrigins()` dans `api/config.php` autorise `localhost:3000`, le développement local fonctionne donc avec les vraies données.

## Déploiement sur LWS

1. Générer les fichiers statiques :
```bash
pnpm generate
```

2. Transférer par FTP à la racine `htdocs/`, **dans cet ordre** :
   - `annuaire-tsa-upload/2-site/` — le contenu de `.output/public/` sans le `.htaccess`
   - `annuaire-tsa-upload/3-service-worker/` — `sw.js` et `workbox-*.js` en dernier,
     pour qu'aucun visiteur ne reçoive un service worker plus récent que le site
   - le `.htaccess`, à part, **uniquement s'il a changé**
   - les fichiers de `api/` qui ont changé

   Puis recharger la page deux fois : le premier rechargement installe le nouveau
   service worker, le second sert la nouvelle version.

   `api/config.php` ne part **jamais** dans un dossier de déploiement : il contient le
   mot de passe de la base, le hash administrateur et les identifiants SMTP. Quand il
   doit changer, il est préparé à part et transféré seul.

3. Renseigner les identifiants BDD dans `api/config.php`

4. Générer un hash bcrypt pour le mot de passe admin :
```bash
php -r "echo password_hash('votre_mdp', PASSWORD_BCRYPT);"
```

5. Coller le hash dans `api/config.php` (`ADMIN_HASH`)

> Le sitemap est généré automatiquement à chaque build via `@nuxtjs/sitemap`. Il inclut toutes les pages statiques + les pages `/departement/XX` dynamiquement depuis l'API. Bing est notifié automatiquement via IndexNow.

### Pièges de cache (PWA / LWS) — à connaître

Ce site est une SSG multi-pages avec service worker. Quelques règles importantes apprises en production :

- **Ne jamais mettre de cache long sur `sw.js`.** Le `.htaccess` force `no-cache` sur `sw.js` / `workbox-*.js`. Sinon le navigateur garde un ancien service worker qui sert un ancien front, et les mises à jour ne se propagent jamais (même après purge du cache LWS).
- **`navigateFallback` doit rester `undefined`** dans la config PWA. Un fallback vers `/` casse les pages au rechargement (le SW sert l'accueil à la place de la vraie page).
- `clientsClaim` + `skipWaiting` sont activés pour que le nouveau SW prenne le contrôle immédiatement.
- Après chaque déploiement : **purger le cache LWS** et tester en navigation privée.

## Accès admin

- **Admin annuaire** : `https://www.annuaire-tsa.fr/admin/login`
- **Admin livres** : `https://www.annuaire-tsa.fr/admin/livres`
- **Admin vidéos** : `https://www.annuaire-tsa.fr/admin/videos`
- **Admin associations** : `https://www.annuaire-tsa.fr/admin/associations`

## Sécurité

- Injection SQL impossible (PDO + requêtes préparées, `EMULATE_PREPARES` désactivé)
- Vue échappe par défaut, **sauf les notes des fiches**, rendues en `v-html` : c'est
  `sanitizeHtml()` côté serveur qui protège là, en ne laissant passer qu'une liste
  de balises et le seul attribut `href` en `http(s)`
- Limitation de débit par IP : signalements et suggestions 5/heure, formulaire de
  contact 10/heure et 40/jour, connexion admin 10 par quart d'heure, proxy BnF 12/heure
  sur les seules requêtes qui sortent réellement vers data.bnf.fr
- Validation stricte des entrées (longueur, type de praticien, URLs) — les mêmes
  contrôles côté public et côté administration
- HTTPS forcé + en-têtes de sécurité (HSTS, X-Frame-Options, CSP…)
- Authentification bcrypt + jetons de session de 256 bits
- Session valable 2 heures à compter de la connexion (durée absolue, pas une inactivité)
- Lien de désactivation du formulaire de contact confirmé par POST : les messageries
  préchargent les liens des courriels, un GET aurait coupé le formulaire sans clic
- Piège à robots et délai minimum de saisie sur le formulaire de contact
- Politique de signalement des failles : voir `SECURITY.md`

## Historique des versions

| Version | Contenu |
|---|---|
| V1 | Annuaire TSA — version initiale HTML |
| V2 | Refonte design, ajout signalements et confirmations communautaires |
| V3 | Ajout du site Livres TSA intégré |
| V4 | Réécriture complète en Nuxt 4 + Vue 3, admin moderne, sécurité renforcée |
| V4.1 | PWA, accessibilité (OpenDyslexic, contraste, taille police), pages département, pagination, partage fiche |
| V4.2 | Ajout page Associations TSA (290 associations, source AIS Apache 2.0), schema.org WebSite, corrections SEO |
| V4.3 | Base praticiens enrichie (ADELI + sources Tamis-Autisme), nouveautés livres via data.bnf.fr, affichage ADELI, refonte fiche praticien (partage Facebook, aération des notes), pagination/filtres dans l'URL, corrections de navigation et de cache PWA |
| V4.4 | Page Centres Ressources Autisme (47 centres, parcours de diagnostic en trois niveaux), formulaire de contact par praticien (SMTP, consentement explicite, lien de désactivation autonome), page `/donnees-praticiens` d'information RGPD, admin `/admin/contacts`, champ « détails » obligatoire sur les signalements, mentions légales complétées d'un responsable du traitement, page `/couts` de transparence sur les frais |
| V4.5 | Campagne d'information des praticiens au titre de l'article 14 du RGPD (219 praticiens contactés), cadre de bonne conduite affiché avant les liens de contact, disparition du « nous » éditorial (le projet est tenu par une seule personne), type de praticien « Structure », rapprochement des fiches avec l'annuaire santé et bascule ADELI → RPPS, correctif de `sanitizeHtml` qui privait les liens des notes de leur `href` |
| V4.7 | Critère d'admission écrit et appliqué : identifiant vérifié obligatoire pour les praticiens, SIRET ou FINESS facultatif pour les structures, énoncé sur `/suggerer` et `/donnees-praticiens`. Formulaire public de suggestion d'associations et écran de modération. Purge du journal de contact à douze mois |
| V4.6 | Rubrique `/ressources` réunissant les livres et une nouvelle section vidéos (façade au clic, chaînes en liens sortants, catégories par position d'énonciation), `api/videos.php`, admin dédiée, redirections 301 depuis `/livres` |

## Remerciements

Ce projet avance aussi grâce à ceux qui prennent le temps de tester, de signaler ce qui
ne fonctionne pas, ou de corriger leur fiche. Ici, écrire le code n'est pas le plus
difficile : c'est de savoir ce qui cloche, et personne ne le voit mieux que ceux qui
utilisent le site.

- [@1000i100](https://github.com/1000i100) pour avoir signalé que la recherche de
  praticiens ne répondait plus, testée sur deux navigateurs ([#1](https://github.com/Pandorra40/annuaire-tsa/issues/1))

## Vibe coding

Ce projet a été entièrement vibecodé avec [Claude Code](https://claude.ai/code) (IA d'Anthropic). La vision, les choix fonctionnels et les orientations sont humains — le code a été généré par l'IA.

## Licence

Projet open source — données hébergées en France — RGPD
Fait avec ♥ pour les familles concernées par les TSA
