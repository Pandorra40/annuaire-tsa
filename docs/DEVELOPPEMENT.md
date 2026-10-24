# Développement — Annuaire TSA

Notes pour contribuer, builder et comprendre la base.  
Présentation du site : [README.md](../README.md).

## Prérequis

- **Node.js** 22+ (CI en Node 22)
- **pnpm** 10 (`packageManager` dans `package.json`)
- **MariaDB** (ou MySQL compatible) pour l’API locale

## Démarrage local

```bash
cp .env.example .env   # renseigner DB_* et ADMIN_HASH
pnpm install
pnpm dev
```

Site + API Nitro : `http://localhost:3000` (`public.apiBase` = `/api`).  
Sans BDD locale, le front peut encore pointer temporairement vers l’API de production via `apiBase`.

## Build

```bash
pnpm build
```

Résultat dans `.output/` (SSR + API Nitro). Le sitemap est généré à chaque build via `@nuxtjs/sitemap`. IndexNow n’est pas branché au module sitemap : signalement Bing à la main avec `indexnow.mjs` à la racine du dépôt.

Variables d’environnement **serveur** (jamais committer) : `DB_*`, `ADMIN_HASH`, éventuellement `SMTP_*` et `PUSHBULLET_TOKEN`. Quotter les valeurs contenant `$` (hash bcrypt), sinon le shell les tronque.

## Pièges de cache (PWA)

- **`navigateFallback` doit rester `undefined`** dans la config PWA. Un fallback vers `/` casse les pages au rechargement.
- `clientsClaim` + `skipWaiting` : le nouveau SW prend le contrôle immédiatement.
- Workbox ne précache pas le HTML (`globPatterns` sans `html`).

## Base de données

### Tables annuaire

- `praticiens` — fiches publiées. Contenu descriptif en sept colonnes texte (`types_intervention`, `bilans`, `formations`, `experience`, `modalites`, `tarifs`, `autres_infos`) ; second lieu optionnel (`ville2`, `adresse2`, `departement2`). L’ancienne colonne `notes` (HTML Tiptap) reste en base sans être lue (filet / backfill hors dépôt). `fait_bilans` (`TINYINT` nullable) : `NULL` = « on ne sait pas » (pas « non ») ; `0` = affirmation admin seulement.
- `suggestions` — suggestions de praticiens en attente, même structure de contenu
- `signalements` — `detail` = relevé structuré de `/signaler` (rubrique, valeur actuelle, valeur corrigée)

Les tables de contribution `suggestions`, `signalements`, `suggestions_associations`, `suggestions_livres` ont une colonne `contact_auteur` (réponse à l’auteur, facultative, distincte des e-mails publics ; dans `suggestions_associations`, `email` = adresse publique de l’asso).

- `admin_sessions` — sessions administrateur
- `site_settings` — réglages clé/valeur (créée au besoin). Clés `maintenance_actif` (`0`/`1`) et `maintenance_message` : mode maintenance activable depuis l’admin (page `/maintenance`, HTTP 503 + `Retry-After`). L’admin reste joignable.
- `praticiens_contact` — e-mail, consentement, jeton de désactivation du formulaire (séparé de `praticiens` : le public ne voit que `contact_actif`)
- `contact_journal` — métadonnées des messages (date, fiche, IP, expéditeur), **jamais le contenu**, purge au-delà de 12 mois

### Tables associations

- `associations` — associations publiées
- `suggestions_associations` — suggestions en attente de modération

### Tables ressources

- `livres` — livres publiés (classiques + suggestions validées)
- `suggestions_livres` — suggestions en attente
- `videos` — vidéos et chaînes (`type` : vidéo → `youtube_id` 11 car. ; chaîne → `url` normalisée)

## Hébergement (rappel)

Auto-hébergé : VPS Infomaniak = porte d’entrée ; app Node + MariaDB sur le serveur de l’éditeur.  
Détails d’exploitation (proxy, chemins, supervision) : **hors dépôt**.
