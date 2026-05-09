# Annuaire TSA — V3

Projet open source communautaire pour les familles concernées par les troubles du spectre autistique (TSA).

## Ce que contient le projet

### 1. Annuaire TSA
Annuaire collaboratif et gratuit de praticiens spécialisés TSA : psychiatres, pédopsychiatres, psychologues, neuropsychologues, orthophonistes, ergothérapeutes et psychomotriciens.

- Recherche par ville, département ou spécialité
- Filtres par type de praticien, tranche d'âge et mode de consultation
- Système de confirmation et signalement communautaire
- Suggestion de praticiens par la communauté

### 2. Livres TSA (`/livres/`)
Sélection collaborative de livres sur le TSA, ajouté en V3.

- **Grands classiques** — sélection éditoriale stockée en base de données
- **Recommandations de la communauté** — livres suggérés et validés par les utilisateurs
- **Dernières parutions** — mises à jour automatiquement via Open Library (sans clé API)
- Formulaire de suggestion de livres sans inscription

## Stack technique

| Composant | Technologie |
|---|---|
| Frontend | HTML / CSS / JavaScript vanilla |
| Backend | PHP 8.4 |
| Base de données | MySQL |
| Hébergement | LWS (serveur mutualisé) |
| API externe | Open Library (nouveautés livres) |

## Structure des fichiers

```
annuaire-tsa/
├── index.html              # Page principale annuaire
├── suggerer.html           # Formulaire suggestion praticien
├── fiche.html              # Fiche détaillée praticien
├── signaler.html           # Signaler une erreur
├── apropos.html
├── contact.html
├── mentions.html
├── merci.html
│
├── css/
│   └── style.css
├── js/
│   └── config.js           # Configuration API
├── img/
│   ├── logo-tsa.svg
│   └── icon-192.png
│
├── api/
│   ├── config.php           # Connexion BDD + fonctions communes
│   ├── auth.php             # Authentification admin
│   ├── praticiens.php       # CRUD praticiens (public + admin)
│   ├── admin_praticiens.php # Gestion admin praticiens
│   ├── suggestions.php      # Suggestions de praticiens
│   ├── signalements.php     # Signalements
│   ├── livres.php           # CRUD livres
│   ├── suggestions_livres.php # Suggestions de livres
│   └── openlibrary_proxy.php  # Proxy PHP vers Open Library
│
├── admin/
│   ├── login.html           # Connexion admin
│   ├── index.html           # Admin annuaire (praticiens)
│   ├── modifier.html        # Modifier une fiche praticien
│   └── livres.html          # Admin livres TSA
│
├── livres/                  # Site Livres TSA
│   ├── index.html
│   ├── suggerer.html
│   ├── script.js
│   └── styles.css
│
└── livres_tables.sql        # SQL à exécuter sur LWS pour les tables livres
```

## Base de données

### Tables annuaire
- `praticiens` — fiches praticiens publiées
- `suggestions` — suggestions de praticiens en attente de validation
- `signalements` — signalements d'erreurs sur les fiches
- `admin_sessions` — sessions administrateur

### Tables livres (V3)
- `livres` — livres publiés (classiques + suggestions validées)
- `suggestions_livres` — suggestions de livres en attente de validation

Le fichier `livres_tables.sql` contient le SQL de création des tables livres ainsi que les données initiales des grands classiques.

## Installation sur LWS

1. Uploader tous les fichiers via FTP à la racine `htdocs/`
2. Exécuter `livres_tables.sql` dans phpMyAdmin
3. Renseigner les identifiants BDD dans `api/config.php`
4. Générer un hash bcrypt pour le mot de passe admin dans `api/config.php`

## Accès admin

- **Admin annuaire** : `https://www.annuaire-tsa.fr/admin/`
- **Admin livres** : `https://www.annuaire-tsa.fr/admin/livres.html`

## Historique des versions

| Version | Contenu |
|---|---|
| V1 | Annuaire TSA — version initiale |
| V2 | Refonte design, ajout signalements et confirmations communautaires |
| V3 | Ajout du site Livres TSA intégré |

## Licence

Projet open source — données hébergées en France — RGPD
Fait avec ♥ pour les familles concernées par les TSA
