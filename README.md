<p align="center">
  <img src="docs/banner.png" alt="Annuaire TSA" width="1280" height="640" />
</p>

# Annuaire TSA — V4.13.12

Projet open source communautaire pour les familles concernées par les troubles du spectre autistique (TSA).

**Site :** [https://www.annuaire-tsa.fr](https://www.annuaire-tsa.fr/)  
**Licence :** [AGPL-3.0](LICENSE) · **Sécurité :** [SECURITY.md](SECURITY.md)

En septembre 2026, le site a enregistré environ **3 800 visites** (statistiques d’hébergement, **hors robots** déjà isolés — Googlebot, bingbot, crawlers SEO, etc.).

<p align="center">
  <a href="https://www.annuaire-tsa.fr/"><img alt="Site" src="https://img.shields.io/badge/site-annuaire--tsa.fr-4f46e5?style=for-the-badge"></a>
  <img alt="Licence" src="https://img.shields.io/badge/licence-AGPL--3.0-blue?style=for-the-badge">
  <img alt="Nuxt" src="https://img.shields.io/badge/Nuxt-4-00DC82?style=for-the-badge&logo=nuxt&logoColor=white">
  <img alt="Vue" src="https://img.shields.io/badge/Vue-3-42b883?style=for-the-badge&logo=vuedotjs&logoColor=white">
  <img alt="Nitro" src="https://img.shields.io/badge/Nitro-Node-00DC82?style=for-the-badge&logo=nodedotjs&logoColor=white">
</p>

## Ce que contient le projet

### 1. Annuaire TSA
Annuaire collaboratif et gratuit de praticiens spécialisés TSA : psychiatres, pédopsychiatres, psychologues, neuropsychologues, orthophonistes, ergothérapeutes et psychomotriciens, ainsi que les structures (cabinets, instituts, centres).

- Recherche par ville, département ou métier (plusieurs mots = tous requis)
- Filtres : type de praticien, tranche d’âge, téléconsultation, réalisation de bilans
- Confirmations et signalements par la communauté
- Contact par écrit sur certaines fiches (uniquement avec l’accord du praticien ; son adresse e-mail n’est jamais affichée)
- Suggestion d’une fiche sur **une seule page** (`/suggerer`) : profil famille ou praticien, puis le formulaire
- Une page par département (`/departement/XX`)
- Fiches partageables (Facebook ou copie du lien) ; sur l’accueil, recherche et filtres restent dans l’URL
- Identifiant professionnel affiché quand il est connu (RPPS, ADELI, ou SIRET / FINESS pour une structure)
- **Admission** : un praticien n’entre que si son identifiant national est vérifié ; la suggestion exige RPPS/ADELI et un moyen de contact (tél. ou e-mail) ; pour une structure, SIRET ou FINESS sont acceptés sans être exigés (détail sur `/suggerer` et `/donnees-praticiens`)
- Notes organisées en rubriques (interventions, bilans, formations, expérience, modalités, tarifs, autres)
- Possibilité d’indiquer un second lieu d’exercice
- Sources : Autisme et TND Info Service, Tamis-Autisme, enrichissement manuel

### 2. Associations TSA (`/associations/`)
Environ **290** associations spécialisées TSA en France (familles, personnes concernées, professionnels).

- Recherche par nom, ville, département ou service
- Coordonnées quand elles sont connues (téléphone, e-mail, site), services et public concerné
- Chacun peut proposer une association (`/associations/suggerer`) ; publication après relecture
- Source : Autisme et TND Info Service (réutilisation d’information non commerciale, source citée)

### 3. Ressources (`/ressources/`)
Livres et vidéos au même niveau dans le menu : deux façons de s’informer, sans hiérarchie.

#### Livres (`/ressources/livres/`)
- Une sélection éditoriale de « grands classiques »
- Les parutions récentes, mises à jour via la BnF (data.bnf.fr)
- Suggestion d’un livre sans créer de compte

#### Vidéos (`/ressources/videos/`)
Chaînes et vidéos choisies une par une, sans pastille « pour qui » : une ressource peut servir à tout le monde.

- Le lecteur YouTube ne se charge **qu’après un clic** (rien vers Google avant)
- Une chaîne est un lien vers YouTube, pas une vidéo intégrée
- Chaque entrée a une courte description
- Seules les adresses YouTube de vidéo ou de chaîne sont acceptées

### 4. Centres Ressources Autisme (`/cra/`)
**46** entrées publiques : 27 CRA (régionaux et antennes), 16 centres IntimAgir, 2 centres spécialisés et le GNCRA, avec le parcours de diagnostic expliqué.

- Recherche par nom, région, ville ou département ; filtre par type de centre
- Regroupement par région et coordonnées (adresse, téléphone, e-mail, site)
- Parcours de repérage et de diagnostic en trois niveaux (stratégie nationale pour l’autisme)
- Données institutionnelles publiques (GNCRA / Autisme et TND Info Service), maintenues avec le site

## Stack technique

| Composant | Technologie |
|---|---|
| Frontend | Nuxt ≥4.6.2 + Vue 3 + Nuxt UI + Tailwind CSS |
| Recherche | Orama (index et recherche côté navigateur) |
| API | Nitro (Node) — routes `server/api/*`, URLs propres `/api/praticiens`, … |
| Base de données | MariaDB (+ phpMyAdmin) |
| Serveur | Accès BDD (`mysql2`), auth admin (`bcryptjs`), envoi des mails (`nodemailer` ≥10.2) |
| Hébergement | Auto-hébergé (VPS Infomaniak en porte d’entrée publique + serveur de l’éditeur pour l’app et la base) |
| API externe | data.bnf.fr / BnF — SPARQL (nouveautés livres) |
| Typage | TypeScript |
| SEO | Bing Webmaster Tools + @nuxtjs/sitemap + @nuxtjs/robots ; JSON-LD Schema.org (`WebSite` + fiches) ; IndexNow via script manuel `indexnow.mjs` |
| PWA | @vite-pwa/nuxt — installable sur mobile |

L’ancienne API PHP n’est plus dans ce dépôt ni servie en production ; un rollback éventuel repose sur une archive hors dépôt (serveur), pas sur le code Nuxt actuel.

## Accessibilité

- **A- / A+** — taille de police réglable (4 niveaux)
- **Mode lecture** — police OpenDyslexic sur le contenu (`main` + pied de page, pas le bandeau), interligne augmenté, animations et transitions coupées
- **Contraste élevé** — noir pur sur blanc pur pour les malvoyants
- **Facile à lire (FALC)** — textes alternatifs sur `/apropos`, `/contact` et `/suggerer` ; le bouton n’apparaît que sur ces pages
- Réglages disponibles sur desktop (navbar) et mobile (menu hamburger)
- `prefers-reduced-motion` respecté automatiquement (CSS)

## Structure des fichiers

Racine du dépôt GitHub (= projet Nuxt, pas un sous-dossier monorepo) :

```
.
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
│   │   ├── CartePraticien.vue / FiltresPraticiens.vue
│   │   ├── ChampRechercheOrama.vue / ChampContactAuteur.vue
│   │   ├── ContactAuteurAdmin.vue # Recontact auteur (écran admin)
│   │   ├── RessourcesOnglets.vue # Onglets Livres / Vidéos
│   │   └── VideoFacade.vue      # Lecteur YouTube chargé au clic, jamais avant
│   ├── composables/
│   │   ├── useApi.ts            # Appels API centralisés
│   │   ├── useFalcMode.ts       # État partagé du mode FALC
│   │   └── useOramaRecherche.ts # Recherche client (Orama)
│   ├── data/
│   │   ├── cra.ts               # Centres Ressources Autisme (données statiques, hors BDD)
│   │   └── finances.ts          # Coûts du site (données statiques, hors BDD)
│   ├── types/
│   │   └── index.ts             # Types TypeScript
│   ├── utils/
│   │   ├── meta.ts              # Échappe les esperluettes des balises meta (unhead ne le fait pas)
│   │   └── schemaOrg.ts         # JSON-LD fiches praticien / association
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
│       ├── remerciements.vue    # Gratuité du site et remerciements (remplace /couts)
│       ├── stats.vue            # Ancienne URL publique des stats (redirige vers l’admin)
│       └── admin/
│           ├── login.vue        # Connexion admin
│           ├── index.vue        # Dashboard admin praticiens
│           ├── modifier.vue     # Modifier une fiche praticien
│           ├── contacts.vue     # Emails et consentements des formulaires
│           ├── livres.vue       # Admin livres TSA
│           ├── videos.vue       # Admin vidéos et chaînes
│           ├── associations.vue # Modération des suggestions d'associations
│           ├── modifier-association.vue # Modifier une fiche association
│           └── stats.vue        # Stats, IP exclues, journal login admin

server/                          # API Nitro (même process Node que le front)
├── api/
│   ├── praticiens.get.ts        # Lectures publiques (+ PATCH confirmation)
│   ├── associations.get.ts
│   ├── livres.* / videos.*      # Public + mutateurs admin
│   ├── auth.*                   # Cookie HttpOnly tsa_admin (Path=/)
│   ├── stats-hit.post.ts / stats.get.ts
│   ├── admin-stats-exclude.* / admin-login-log.get.ts
│   ├── suggestions* / signalements.* / contact.*
│   ├── admin-praticiens.* / admin-associations.*
│   └── bnf-proxy.get.ts         # Proxy SPARQL BnF + cache fichier
├── utils/                       # DB, auth, rateLimit, validators, mail, Pushbullet…
└── error.ts                     # Réponses `{ "error": "…" }` alignées sur l’ancienne API
```

## Prérequis

- **Node.js** 22 ou plus · **pnpm** 10 · **MariaDB** (ou MySQL) pour l’API locale  
- Détail build, PWA, schéma BDD : [docs/DEVELOPPEMENT.md](docs/DEVELOPPEMENT.md)

## Développement local

```bash
cp .env.example .env   # puis renseigner DB_* et ADMIN_HASH
pnpm install
pnpm dev
```

Site + API : `http://localhost:3000`. Voir aussi [docs/DEVELOPPEMENT.md](docs/DEVELOPPEMENT.md).

## Hébergement

Le site est **auto-hébergé** : VPS Infomaniak en porte d’entrée publique ;
application et base sur le serveur de l’éditeur. Détails d’exploitation hors dépôt.

## Sécurité

- Injection SQL : requêtes préparées via `mysql2` (même sémantique que l’ancien PDO)
- Contenu des fiches : les sept rubriques sont du texte simple (échappé par Vue) — plus
  de `v-html` sur ce bloc depuis le retrait de Tiptap
- Limitation de débit par IP : signalements et suggestions 5/heure, formulaire de
  contact 10/heure et 40/jour, connexion admin 10 par quart d'heure, proxy BnF 12/heure
  sur les seules requêtes qui sortent réellement vers data.bnf.fr
- Journal des tentatives de connexion admin (`admin_login_log`) avec alerte Pushbullet
  après 5 échecs depuis la même IP en 15 minutes
- Stats de visite agrégées sans stocker d’IP ; liste d’IP exclues éditable dans l’admin
- Validation stricte des entrées (longueur, type de praticien, URLs) — les mêmes
  contrôles côté public et côté administration
- HTTPS ; HSTS côté reverse proxy ; côté app : CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- Authentification bcrypt (`bcryptjs`, hash `$2y$` PHP) + jetons de session de 256 bits
- Cookie admin `tsa_admin` HttpOnly, `SameSite=Strict`, `Path=/` (partagé `/admin` et `/api`)
- Session valable 2 heures à compter de la connexion (durée absolue, pas une inactivité)
- Lien de désactivation du formulaire de contact confirmé par POST : les messageries
  préchargent les liens des courriels, un GET aurait coupé le formulaire sans clic
- Piège à robots et délai minimum de saisie sur le formulaire de contact
- Signalement des failles : [SECURITY.md](SECURITY.md)

## Contribuer

- Bugs et idées : ouvrir une [issue](https://github.com/Pandorra40/annuaire-tsa/issues) (pas de faille de sécu en public — voir [SECURITY.md](SECURITY.md))
- Correctifs : fork + branche + pull request ; avant d’ouvrir la PR, `pnpm lint`, `pnpm typecheck` et `pnpm test`
- Build, variables d’environnement, PWA, tables MariaDB : [docs/DEVELOPPEMENT.md](docs/DEVELOPPEMENT.md)
- Le projet est tenu par une seule personne : les retours utilisateurs du site comptent autant que le code

## Historique des versions

Jalons visibles sur le site (le détail fichier par fichier reste dans les commits).

| Version | Contenu |
|---|---|
| V1 | Annuaire TSA — version initiale HTML |
| V2 | Refonte design, signalements et confirmations communautaires |
| V3 | Site Livres TSA intégré |
| V4 | Réécriture Nuxt 4 + Vue 3, admin et sécurité renforcée |
| V4.1 | PWA, accessibilité (OpenDyslexic, contraste, taille police), pages département, pagination, partage fiche |
| V4.2 | Annuaire associations TSA, schema.org WebSite, corrections SEO |
| V4.3 | Base praticiens enrichie, nouveautés livres via data.bnf.fr, refonte fiche, filtres dans l’URL |
| V4.4 | Centres Ressources Autisme, contact par praticien, page données praticiens (RGPD), transparence des coûts |
| V4.5 | Information RGPD des praticiens, cadre de bonne conduite, type « Structure », bascule ADELI → RPPS |
| V4.6 | Rubrique `/ressources` (livres + vidéos, façade YouTube au clic) |
| V4.7 | Critère d’admission (identifiant vérifié), suggestion d’associations |
| V4.8 | Note en sept rubriques, second lieu optionnel sur les fiches |
| V4.9 | Audit UX : correctif Corse / outre-mer, recherche et filtres refondus, bilans filtrables, signalement par rubriques |
| V4.10 | Formulaire `/suggerer` en trois écrans, page `/remerciements`, mode lecture recentré sur le contenu |
| V4.11 | Statistiques réservées à l’admin (visites, volumes, journal de connexion) |
| V4.12 | API passée sous Nitro (Node) : mêmes URLs `/api/*`, front et API dans le même process |
| V4.13 | FALC (À propos, Contact, Suggérer) ; durées de conservation RGPD clarifiées |
| V4.13.x | Retouches : retrait du mode calme, perf / accessibilité, JSON-LD sur les fiches, vidéos sans catégories d’audience (libellé Description) |
| V4.13.11 | Correctifs sécu (Nuxt ≥4.6.2, nodemailer ≥10.2) ; mode maintenance activable (page publique 503) |
| V4.13.12 | `/suggerer` en une page ; RPPS/ADELI + contact obligatoires (UI + API) ; recherche ET, 404 et empty states ; correctifs UX d’audit |
| — | Mentions légales : VPS Infomaniak en porte d’entrée, application auto-hébergée |

## Remerciements

Ce projet avance aussi grâce à ceux qui prennent le temps de tester, de signaler ce qui
ne fonctionne pas, ou de corriger leur fiche. Le code est produit par des LLM (voir
ci-dessous) ; ce que seul un utilisateur du site peut vraiment apporter, c’est de dire
ce qui cloche ou ce qui manque une fois le site utilisé pour de vrai.

- [@1000i100](https://github.com/1000i100) pour avoir signalé que la recherche de
  praticiens ne répondait plus, testée sur deux navigateurs ([#1](https://github.com/Pandorra40/annuaire-tsa/issues/1))

## Vibe coding

Ce projet a été entièrement vibecodé avec [Claude Code](https://claude.ai/code) (IA d'Anthropic) ; il continue aujourd'hui grâce à [Cursor](https://cursor.com) (Grok et Composer). La vision, les choix fonctionnels et les orientations sont humains — le code a été généré par l'IA.

## Licence

Ce projet est sous licence [**GNU Affero General Public License v3.0** (AGPL-3.0)](LICENSE).

Traitement des données : voir les pages légales du site (mentions, données praticiens).

Fait avec ♥ pour les familles concernées par les TSA
