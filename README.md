# Annuaire TSA

Annuaire collaboratif et gratuit de praticiens spécialisés dans les troubles du spectre autistique (TSA).

Projet open source · Sans publicité · Données hébergées en France

---

## Structure des fichiers

```
annuaire-tsa/
│
├── index.html          → Page d'accueil (recherche + filtres + liste)
├── fiche.html          → Page détaillée d'un praticien
├── praticien.html      → Formulaire auto-déclaration praticien
├── suggerer.html       → Formulaire suggestion communautaire
├── signaler.html       → Formulaire signalement d'erreur
├── merci.html          → Page de confirmation après envoi
├── apropos.html        → À propos & FAQ du projet
├── contact.html        → Page de contact
├── mentions.html       → Mentions légales
│
├── admin/
│   ├── login.html      → Page de connexion sécurisée
│   ├── index.html      → Interface d'administration
│   └── modifier.html   → Modification d'une fiche praticien
│
├── css/
│   └── style.css       → Feuille de style commune à toutes les pages
│
├── js/
│   └── config.js       → Configuration Supabase (URL + clé API)
│
└── img/
    └── logo-tsa.svg    → Logo symbole neurodiversité
```

---

## Installation

### 1. Créer un projet Supabase

1. Rendez-vous sur [supabase.com](https://supabase.com) et créez un compte gratuit
2. Créez un nouveau projet — choisissez la région **France** pour la conformité RGPD
3. Dans **Settings > API**, copiez votre **Project URL** et votre **anon public key**

### 2. Créer les tables dans Supabase

Dans l'éditeur SQL de Supabase, exécutez :

```sql
CREATE TABLE praticiens (
  id                    BIGSERIAL PRIMARY KEY,
  nom                   TEXT NOT NULL,
  type                  TEXT NOT NULL,
  ville                 TEXT NOT NULL,
  departement           TEXT NOT NULL,
  adresse               TEXT,
  telephone             TEXT,
  site_web              TEXT,
  teleconsultation      BOOLEAN DEFAULT false,
  delai                 TEXT,
  ages                  TEXT[],
  notes                 TEXT,
  adeli                 TEXT,
  confirmations         INT DEFAULT 0,
  derniere_confirmation TIMESTAMPTZ,
  statut                TEXT DEFAULT 'publie',
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE suggestions (
  id               BIGSERIAL PRIMARY KEY,
  nom              TEXT NOT NULL,
  type             TEXT NOT NULL,
  ville            TEXT NOT NULL,
  departement      TEXT NOT NULL,
  adresse          TEXT,
  telephone        TEXT,
  site_web         TEXT,
  teleconsultation BOOLEAN DEFAULT false,
  delai            TEXT,
  ages             TEXT[],
  notes            TEXT,
  adeli            TEXT,
  statut           TEXT DEFAULT 'en_attente',
  source           TEXT DEFAULT 'communaute',
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

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

### 3. Activer la sécurité RLS

```sql
ALTER TABLE praticiens    ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE signalements  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lecture publique praticiens"
  ON praticiens FOR SELECT
  USING (statut = 'publie');

CREATE POLICY "insertion publique suggestions"
  ON suggestions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "insertion publique signalements"
  ON signalements FOR INSERT
  WITH CHECK (true);

CREATE POLICY "admin praticiens"
  ON praticiens FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "admin suggestions"
  ON suggestions FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "admin signalements"
  ON signalements FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
```

### 4. Créer le compte admin

Dans **Supabase > Authentication > Users**, cliquez sur **Add user** et créez votre compte admin avec email + mot de passe.

### 5. Configurer le projet

Ouvrez `js/config.js` et renseignez vos valeurs Supabase :

```javascript
const SUPABASE_URL = "https://VOTRE_URL.supabase.co";
const SUPABASE_ANON_KEY = "VOTRE_CLE_PUBLIQUE";
```

### 6. Déployer le site

**Option A — GitHub Pages (gratuit, idéal pour tester)**

1. Créez un dépôt public sur GitHub
2. Déposez tous les fichiers à la racine du dépôt
3. Dans **Settings > Pages**, sélectionnez la branche `main` comme source
4. Votre site sera disponible sur `https://VOTRE_COMPTE.github.io/annuaire-tsa`

Notez que GitHub Pages ne supporte pas le fichier `.htaccess` — les headers de sécurité HTTP ne s'appliqueront pas dans cette configuration.

**Option B — Hébergeur français (recommandé pour la production)**

Uploadez tous les fichiers à la racine de votre hébergement (`htdocs/` chez LWS, `www/` chez OVH).
Ajoutez le fichier `.htaccess` pour les headers de sécurité HTTP.

Le site est immédiatement fonctionnel — aucune configuration serveur supplémentaire requise.

---

## Ping anti-veille Supabase

Pour éviter la mise en veille de Supabase après 7 jours d'inactivité (plan gratuit), créez le fichier `.github/workflows/ping.yml` :

```yaml
name: Ping Supabase
on:
  schedule:
    - cron: '0 8 * * 1,4'
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping
        run: curl -s "${{ secrets.SUPABASE_URL }}/rest/v1/praticiens?limit=1" -H "apikey: ${{ secrets.SUPABASE_KEY }}" > /dev/null
```

Ajoutez `SUPABASE_URL` et `SUPABASE_KEY` dans **Settings > Secrets** de votre dépôt GitHub.

---

## Déploiement automatique GitHub → LWS

Pour synchroniser automatiquement votre dépôt GitHub avec votre hébergement LWS, créez `.github/workflows/deploy.yml` :

```yaml
name: Deploy vers LWS
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy via FTP
        uses: SamKirkland/FTP-Deploy-Action@v4
        with:
          server: ${{ secrets.FTP_HOST }}
          username: ${{ secrets.FTP_USER }}
          password: ${{ secrets.FTP_PASSWORD }}
          server-dir: /htdocs/
```

Ajoutez `FTP_HOST`, `FTP_USER` et `FTP_PASSWORD` dans **Settings > Secrets** de votre dépôt GitHub. Ces identifiants sont disponibles dans votre panneau LWS.

---

## Licence

AGPL-3.0 — Voir [LICENSE](LICENSE)
