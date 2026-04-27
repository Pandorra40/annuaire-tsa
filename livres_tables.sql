-- ============================================================
-- LIVRES TSA — Tables à exécuter sur LWS (phpMyAdmin)
-- ============================================================

CREATE TABLE IF NOT EXISTS livres (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    titre       VARCHAR(255) NOT NULL,
    auteur      VARCHAR(255) NOT NULL,
    annee       SMALLINT,
    categorie   ENUM('témoignage','guide pratique','scientifique','jeunesse','roman') NOT NULL,
    type        ENUM('classique','suggestion') NOT NULL DEFAULT 'classique',
    description TEXT,
    lien        VARCHAR(500),
    statut      ENUM('publie','archive') NOT NULL DEFAULT 'publie',
    created_at  DATETIME NOT NULL DEFAULT NOW()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS suggestions_livres (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    titre       VARCHAR(255) NOT NULL,
    auteur      VARCHAR(255) NOT NULL,
    annee       SMALLINT,
    categorie   VARCHAR(100),
    description TEXT,
    lien        VARCHAR(500),
    statut      ENUM('en_attente','valide','refuse') NOT NULL DEFAULT 'en_attente',
    created_at  DATETIME NOT NULL DEFAULT NOW()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Données initiales — Grands classiques
-- ============================================================

INSERT INTO livres (titre, auteur, annee, categorie, type, description, lien) VALUES
('La fille qui pensait en images', 'Temple Grandin', 2015, 'témoignage', 'classique',
 'Temple Grandin raconte comment sa pensée visuelle, liée à son autisme, lui a permis de devenir une pionnière de la zootechnie.',
 'https://openlibrary.org/search?q=Temple+Grandin+pensait+images'),

('Neurotribes', 'Steve Silberman', 2015, 'scientifique', 'classique',
 'Enquête historique sur l\'autisme : ses origines, l\'évolution du diagnostic et les militants de la neurodiversité qui ont transformé le regard de la société.',
 'https://openlibrary.org/search?q=Neurotribes+Silberman'),

('Différent, pas moins', 'Naoki Higashida', 2017, 'témoignage', 'classique',
 'Réflexions profondes d\'un jeune autiste japonais non verbal sur ses émotions, ses désirs et sa façon de percevoir le monde.',
 'https://openlibrary.org/search?q=Naoki+Higashida+Different+not+less'),

('L\'autisme expliqué aux non-autistes', 'Brigitte Harrisson, Lise St-Charles', 2017, 'guide pratique', 'classique',
 'Un guide clair et bienveillant pour les parents, enseignants et professionnels souhaitant mieux comprendre le fonctionnement autistique.',
 'https://openlibrary.org/search?q=autisme+expliqu%C3%A9+non-autistes+Harrisson'),

('Tout sur l\'autisme', 'Laurent Mottron', 2021, 'scientifique', 'classique',
 'Synthèse complète et accessible des connaissances scientifiques actuelles sur l\'autisme par l\'un des experts francophones les plus reconnus.',
 'https://openlibrary.org/search?q=tout+sur+autisme+Mottron'),

('Je suis autiste, et alors ?', 'Annick Vincent', 2022, 'guide pratique', 'classique',
 'Guide pratique pour les adolescents et adultes autistes ainsi que leurs proches, pour mieux comprendre et vivre avec le TSA au quotidien.',
 'https://openlibrary.org/search?q=Je+suis+autiste+et+alors+Vincent');
