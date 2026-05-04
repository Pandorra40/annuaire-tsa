# Annuaire TSA — V4

Projet open source communautaire pour les familles concernées par les troubles du spectre autistique (TSA).

## Ce que contient le projet

### 1. Annuaire TSA
Annuaire collaboratif et gratuit de praticiens spécialisés TSA : psychiatres, pédopsychiatres, psychologues, neuropsychologues, orthophonistes, ergothérapeutes et psychomotriciens.

- Recherche par ville, département ou spécialité
- Filtres par type de praticien, tranche d'âge et mode de consultation
- Système de confirmation et signalement communautaire
- Suggestion de praticiens par la communauté

### 2. Livres TSA (`/livres/`)
Sélection collaborative de livres sur le TSA.

- **Grands classiques** — sélection éditoriale stockée en base de données
- **Dernières parutions** — mises à jour automatiquement via Open Library (sans clé API)
- Formulaire de suggestion de livres sans inscription

## Stack technique

| Composant | Technologie |
|---|---|
| Frontend | Nuxt 4 + Vue 3 + Nuxt UI + Tailwind CSS |
| Backend | PHP 8.4 |
| Base de données | MySQL |
| Hébergement | LWS (serveur mutualisé) |
| API externe | Open Library (nouveautés livres) |
| Typage | TypeScript |

## Structure des fichiers

```
annuaire-tsa-nuxt/
├── app/
│   ├── app.vue                  # Layout global (navbar + footer)
│   ├── app.config.ts            # Configuration Nuxt UI
│   ├── assets/css/main.css      # Styles globaux
│   ├── composables/
│   │   └── useApi.ts            # Appels API centralisés
│   ├── types/
│   │   └── index.ts             # Types TypeScript
│   └── pages/
│       ├── index.vue            # Page d'accueil annuaire
│       ├── praticien/[id].vue   # Fiche détaillée praticien
│       ├── suggerer.vue         # Formulaire suggestion praticien
│       ├── signaler.vue         # Signaler une erreur
│       ├── livres/
│       │   ├── index.vue        # Page livres TSA
│       │   └── suggerer.vue     # Formulaire suggestion livre
│       ├── apropos.vue
│       ├── contact.vue
│       ├── mentions.vue
│       └── admin/
│           ├── login.vue        # Connexion admin
│           ├── index.vue        # Dashboard admin praticiens
│           ├── modifier.vue     # Modifier une fiche praticien
│           └── livres.vue       # Admin livres TSA

api/                             # API PHP (à déployer sur LWS)
├── config.php                   # Connexion BDD + fonctions communes
├── auth.php                     # Authentification admin
├── praticiens.php               # CRUD praticiens (public)
├── admin_praticiens.php         # Gestion admin praticiens
├── suggestions.php              # Suggestions de praticiens
├── signalements.php             # Signalements
├── livres.php                   # CRUD livres
├── suggestions_livres.php       # Suggestions de livres
└── openlibrary_proxy.php        # Proxy PHP vers Open Library
```

## Base de données

### Tables annuaire
- `praticiens` — fiches praticiens publiées
- `suggestions` — suggestions de praticiens en attente de validation
- `signalements` — signalements d'erreurs sur les fiches
- `admin_sessions` — sessions administrateur

### Tables livres
- `livres` — livres publiés (classiques + suggestions validées)
- `suggestions_livres` — suggestions de livres en attente de validation

## Développement local

```bash
npm install
npm run dev
```

Le site sera accessible sur `http://localhost:3000`.

> **Note** : Les appels API vers `annuaire-tsa.fr` seront bloqués par CORS en local. Le site s'affiche correctement mais sans données. Les données seront visibles une fois déployé sur LWS.

## Déploiement sur LWS

1. Générer les fichiers statiques :
```bash
npm run generate
```

2. Uploader via FTP à la racine `htdocs/` :
   - Le contenu du dossier `.output/public/`
   - Le dossier `api/`
   - Le fichier `.htaccess`
   - Le fichier `sitemap.xml`

3. Renseigner les identifiants BDD dans `api/config.php`

4. Générer un hash bcrypt pour le mot de passe admin :
```bash
php -r "echo password_hash('votre_mdp', PASSWORD_BCRYPT);"
```

5. Coller le hash dans `api/config.php` (`ADMIN_HASH`)

## Accès admin

- **Admin annuaire** : `https://www.annuaire-tsa.fr/admin/login`
- **Admin livres** : `https://www.annuaire-tsa.fr/admin/livres`

## Sécurité

- Injection SQL impossible (PDO + prepared statements)
- XSS impossible côté client (Vue.js échappe par défaut)
- Rate limiting sur tous les formulaires publics (5 req/heure/IP)
- Validation stricte des entrées (longueur, type, URLs)
- HTTPS forcé + headers de sécurité (HSTS, X-Frame-Options, CSP…)
- Authentification bcrypt + tokens de session 256 bits
- Anti-spam honeypot sur les formulaires

## Historique des versions

| Version | Contenu |
|---|---|
| V1 | Annuaire TSA — version initiale HTML |
| V2 | Refonte design, ajout signalements et confirmations communautaires |
| V3 | Ajout du site Livres TSA intégré |
| V4 | Réécriture complète en Nuxt 4 + Vue 3, admin moderne, sécurité renforcée |

## Licence

Projet open source — données hébergées en France — RGPD
Fait avec ♥ pour les familles concernées par les TSA
