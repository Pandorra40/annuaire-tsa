# Annuaire TSA

Annuaire collaboratif et gratuit de praticiens spécialisés dans les troubles du spectre autistique (TSA).

Projet open source · Sans publicité · Données hébergées en France

---

## Structure des fichiers

```
annuaire-tsa/
│
├── index.html          → Page d'accueil (recherche + filtres + liste)
├── praticien.html      → Formulaire pour les praticiens (auto-déclaration)
├── suggerer.html       → Formulaire pour suggérer un praticien
├── contact.html        → Page de contact
├── mentions.html       → Mentions légales
│
├── admin/
│   ├── login.html      → Page de connexion sécurisée
│   └── index.html      → Interface d'administration
│
├── css/
│   └── style.css       → Feuille de style commune à toutes les pages
│
└── js/
    └── config.js       → Configuration Supabase (URL + clé API)
```

---

## Installation

### 1. Créer un projet Supabase

1. Rendez-vous sur [supabase.com](https://supabase.com) et créez un compte gratuit
2. Créez un nouveau projet (choisissez la région **Frankfurt** pour l'Europe)
3. Dans **Settings > API**, copiez votre **Project URL** et votre **anon public key**

### 2. Créer les tables dans Supabase

Dans l'éditeur SQL de Supabase, exécutez :

```sql
-- Table des praticiens publiés
CREATE TABLE praticiens (
  id          BIGSERIAL PRIMARY KEY,
  nom         TEXT NOT NULL,
  type        TEXT NOT NULL,
  ville       TEXT NOT NULL,
  departement TEXT NOT NULL,
  adresse     TEXT,
  telephone   TEXT,
  site_web    TEXT,
  teleconsultation BOOLEAN DEFAULT false,
  delai       TEXT,
  ages        TEXT[],
  notes       TEXT,
  statut      TEXT DEFAULT 'publie',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Table des suggestions (en attente de validation)
CREATE TABLE suggestions (
  id          BIGSERIAL PRIMARY KEY,
  nom         TEXT NOT NULL,
  type        TEXT NOT NULL,
  ville       TEXT NOT NULL,
  departement TEXT NOT NULL,
  telephone   TEXT,
  site_web    TEXT,
  teleconsultation BOOLEAN DEFAULT false,
  delai       TEXT,
  ages        TEXT[],
  notes       TEXT,
  statut      TEXT DEFAULT 'en_attente',
  source      TEXT DEFAULT 'communaute',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Table des signalements
CREATE TABLE signalements (
  id            BIGSERIAL PRIMARY KEY,
  praticien_id  BIGINT REFERENCES praticiens(id),
  praticien_nom TEXT,
  motif         TEXT NOT NULL,
  detail        TEXT,
  statut        TEXT DEFAULT 'ouvert',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. Configurer les permissions Supabase (Row Level Security)

```sql
-- Activer RLS sur toutes les tables
ALTER TABLE praticiens    ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE signalements  ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut lire les praticiens publiés
CREATE POLICY "lecture publique praticiens"
  ON praticiens FOR SELECT
  USING (statut = 'publie');

-- Tout le monde peut soumettre une suggestion
CREATE POLICY "insertion publique suggestions"
  ON suggestions FOR INSERT
  WITH CHECK (true);

-- Tout le monde peut signaler
CREATE POLICY "insertion publique signalements"
  ON signalements FOR INSERT
  WITH CHECK (true);

-- Seuls les admins authentifiés gèrent tout le reste
CREATE POLICY "admin praticiens"
  ON praticiens FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "admin suggestions"
  ON suggestions FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "admin signalements"
  ON signalements FOR ALL
  USING (auth.role() = 'authenticated');
```

### 4. Créer le compte admin dans Supabase

Dans **Authentication > Users**, cliquez sur **Add user** et créez votre compte admin avec email + mot de passe.

### 5. Configurer le projet

Ouvrez `js/config.js` et remplacez les deux valeurs :

```javascript
const SUPABASE_URL = "https://VOTRE_URL.supabase.co";
const SUPABASE_ANON_KEY = "VOTRE_CLE_PUBLIQUE";
```

### 6. Mettre à jour les liens

Dans tous les fichiers HTML, remplacez :
- `VOTRE_COMPTE` → votre nom d'utilisateur GitHub
- `annuaire.tsa@gmail.com` → votre adresse email dédiée
- Dans `mentions.html` → votre nom ou pseudonyme

### 7. Déployer sur GitHub Pages

1. Créez un dépôt public sur GitHub nommé `annuaire-tsa`
2. Déposez tous les fichiers à la racine du dépôt
3. Dans **Settings > Pages**, sélectionnez la branche `main` comme source
4. Votre site sera disponible sur `https://VOTRE_COMPTE.github.io/annuaire-tsa`

### 8. Connecter votre domaine OVH (optionnel)

Dans GitHub Pages > Custom domain, entrez votre domaine.
Dans OVH, créez un enregistrement CNAME pointant vers `VOTRE_COMPTE.github.io`.

---

## Ping anti-veille Supabase (optionnel)

Pour éviter la mise en veille de Supabase après 7 jours d'inactivité, créez le fichier `.github/workflows/ping.yml` :

```yaml
name: Ping Supabase
on:
  schedule:
    - cron: '0 8 * * 1,4'  # Lundi et jeudi à 8h
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping
        run: curl -s "${{ secrets.SUPABASE_URL }}/rest/v1/praticiens?limit=1" -H "apikey: ${{ secrets.SUPABASE_KEY }}" > /dev/null
```

Ajoutez `SUPABASE_URL` et `SUPABASE_KEY` dans **Settings > Secrets** de votre dépôt GitHub.

---

## Licence

AGPL-3.0 — Voir [LICENSE](LICENSE)
