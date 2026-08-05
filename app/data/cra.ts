// Centres de Ressources Autisme (CRA) et centres ressources associés.
// Source : annuaire Autisme Info Service / GNCRA.
// Données institutionnelles publiques — pas de table SQL, ces structures sont stables.

export interface CentreRessource {
  nom: string
  categorie: 'CRA' | 'IntimAgir' | 'National' | 'Autre'
  region: string
  departements: string[]
  adresse?: string
  ville?: string
  codePostal?: string
  telephone?: string
  email?: string
  siteWeb?: string
  specialisation?: string
  publicConcerne?: string
  horaires?: string
}

export const CENTRES_RESSOURCES: CentreRessource[] = [
  // ─── CRA régionaux ───
  {
    nom: 'CRA Nord-Pas de Calais',
    categorie: 'CRA',
    region: 'Hauts-de-France',
    departements: ['59', '62'],
    adresse: '255 rue Nelson Mandela',
    ville: 'Loos',
    codePostal: '59120',
    telephone: '03 20 60 62 59',
    email: 'cra@cra-npdc.fr',
    siteWeb: 'https://cra-npdc.fr/',
    specialisation: 'Aide à l\'évaluation diagnostique, bilans, information, formation, accompagnement avant et après diagnostic.',
    publicConcerne: 'Tous âges',
    horaires: 'Accueil et permanence téléphonique du lundi au vendredi, 9h30-13h et 14h-17h (fermé le jeudi). Permanence le lundi soir de 17h à 18h30.'
  },
  {
    nom: 'CRA Picardie',
    categorie: 'CRA',
    region: 'Hauts-de-France',
    departements: ['02', '60', '80'],
    adresse: 'CHU Amiens-Picardie, Site Sud — Bât. St Vincent de Paul, 1 Rond-point du Pr Christian Cabrol',
    ville: 'Amiens',
    codePostal: '80000',
    telephone: '03 22 66 75 40',
    email: 'CRAdePicardie@chu-amiens.fr',
    siteWeb: 'https://www.chu-amiens.fr/patients-et-visiteurs/services-et-contacts/les-structures-basees-en-ville/le-centre',
    specialisation: 'Appui à l\'évaluation diagnostique, information, orientation, formation, études et recherches.',
    publicConcerne: 'Tous âges',
    horaires: 'Du lundi au vendredi, 9h-12h30 et 13h30-17h ou sur rendez-vous.'
  },
  {
    nom: 'CRA Bretagne — Unité d\'appui et de coordination (UAC)',
    categorie: 'CRA',
    region: 'Bretagne',
    departements: ['22', '29', '35', '56'],
    adresse: '3 rue Edouard Belin, 1er étage',
    ville: 'Brest',
    codePostal: '29200',
    telephone: '02 98 85 58 90',
    email: 'contact@cra.bzh',
    siteWeb: 'https://www.cra.bzh/',
    specialisation: 'Appui, soutien, coordination et diffusion des informations. Centre de documentation ouvert à tous.',
    publicConcerne: 'Tout public',
    horaires: 'Pour un diagnostic complexe (niveau 3), contactez les Unités d\'Évaluation Diagnostique Enfants (UEDE) et Adultes (UEDA-R).'
  },
  {
    nom: 'CRA Poitou-Charentes',
    categorie: 'CRA',
    region: 'Nouvelle-Aquitaine',
    departements: ['16', '17', '79', '86'],
    adresse: 'CH Henri Laborit — Pavillon Lagrange, Entrée 29, 370 Avenue Jacques Cœur',
    ville: 'Poitiers',
    codePostal: '86000',
    telephone: '05 49 44 57 59',
    email: 'secretariat-cra@ch-poitiers.fr',
    siteWeb: 'https://cra-pc.fr/',
    publicConcerne: 'Enfants et adolescents',
    horaires: 'Secrétariat 9h-12h / 14h-17h. Fermé le mercredi après-midi.'
  },
  {
    nom: 'CRA PACA — Marseille',
    categorie: 'CRA',
    region: 'Provence-Alpes-Côte d\'Azur',
    departements: ['04', '05', '06', '13', '83', '84'],
    adresse: 'Hôpital Sainte-Marguerite, Service Universitaire de Psychiatrie, 270 boulevard Sainte-Marguerite',
    ville: 'Marseille',
    telephone: '04 91 74 54 39',
    siteWeb: 'https://cra-paca.centredoc.fr/index.php',
    specialisation: 'Évaluation et diagnostic, information et orientation des familles, formation et appui-conseil aux professionnels, recherche.',
    publicConcerne: 'Tous âges',
    horaires: 'Enfants/adolescents : 04 91 74 54 39. Adultes sans déficience intellectuelle : 04 91 74 55 23. Équipe de Marseille pour les 05, 13, 84 et Ouest du 83.'
  },
  {
    nom: 'CRA PACA — Antenne de Nice',
    categorie: 'CRA',
    region: 'Provence-Alpes-Côte d\'Azur',
    departements: ['04', '06', '83'],
    adresse: 'Hôpital Lenval, 4ème étage, 57 avenue de la Californie',
    ville: 'Nice',
    codePostal: '06200',
    telephone: '04 92 03 04 39',
    email: 'cra@lenval.com',
    siteWeb: 'https://lenval.org/centre-ressources-autisme/',
    specialisation: 'Aide à l\'évaluation diagnostique, dépistage précoce, sensibilisation et formation.',
    publicConcerne: 'Enfants et adolescents (0-20 ans)',
    horaires: 'Du lundi au vendredi, 8h30-12h et 13h30-16h30. Équipe de Nice pour les 04, 06 et Est du 83.'
  },
  {
    nom: 'CRA Languedoc-Roussillon',
    categorie: 'CRA',
    region: 'Occitanie',
    departements: ['11', '30', '34', '48', '66'],
    adresse: '291 av du Doyen Giraud',
    ville: 'Montpellier',
    codePostal: '34295',
    telephone: '04 67 33 99 68',
    email: 'cent-ress-autisme@chu-montpellier.fr',
    siteWeb: 'http://www.autisme-ressources-lr.fr',
    publicConcerne: 'Tous publics',
    horaires: 'Secrétariat du lundi au vendredi, 8h30-12h30 et 14h-16h30 (fermé le mercredi après-midi).'
  },
  {
    nom: 'CRA Midi-Pyrénées',
    categorie: 'CRA',
    region: 'Occitanie',
    departements: ['09', '12', '31', '32', '46', '65', '81', '82'],
    adresse: 'ZAC de la Cartoucherie, 2 rue du lieutenant Guy Dedieu',
    ville: 'Toulouse',
    codePostal: '31300',
    telephone: '05 23 61 04 00',
    email: 'accueil@cra-mp.info',
    siteWeb: 'https://www.cra-mp.info/fr/',
    specialisation: 'Accueil et information, orientation et conseil, appui aux pratiques professionnelles, formations, documentation, évaluations diagnostiques pour situations complexes.',
    publicConcerne: 'Toute personne concernée par le TSA en Occitanie Ouest',
    horaires: 'Formation : 05 23 610 418. Documentation : tous les jours 9h-12h30 et 13h30-17h (05 23 610 422).'
  },
  {
    nom: 'CRA Corse',
    categorie: 'CRA',
    region: 'Corse',
    departements: ['2A', '2B'],
    adresse: 'Pôle Bastia : Villa Marie, 3 rue Victor Hugo (20600) · Pôle Ajaccio : Immeuble Pingouin Parc Azur, Bât C, Av. Maréchal Juin (20000)',
    ville: 'Bastia et Ajaccio',
    telephone: '04 95 56 58 50',
    email: 'crabastia@pep2b.corsica',
    siteWeb: 'https://pep2b.corsica/cra-corsica/',
    specialisation: 'Diagnostic, documentation, formation et recherche. Informer et former les familles et les professionnels.',
    publicConcerne: 'Tous âges',
    horaires: 'Pôle Ajaccio : 04 95 50 50 40 — craajaccio@pep2b.corsica'
  },
  {
    nom: 'CRA Normandie',
    categorie: 'CRA',
    region: 'Normandie',
    departements: ['14', '50', '61'],
    adresse: '27 rue des Compagnons',
    ville: 'Caen',
    codePostal: '14000',
    telephone: '02 31 06 58 20',
    email: 'cra-sec@chu-caen.fr',
    siteWeb: 'https://cra-normandie-com.fr/',
    specialisation: 'Accueil, écoute, information, conseil et orientation. Appui et expertise pour les bilans diagnostiques et fonctionnels, y compris cas complexes.',
    publicConcerne: 'Tous âges',
    horaires: 'Secrétariat : lundi/mercredi/jeudi 8h30-12h30 et 13h45-16h30, mardi 13h45-17h, vendredi 8h30-12h30 et 13h45-16h.'
  },
  {
    nom: 'CRA Normandie Seine-Eure',
    categorie: 'CRA',
    region: 'Normandie',
    departements: ['27', '76'],
    adresse: 'Centre Hospitalier du Rouvray, BP 45, 4 Rue Paul Eluard',
    ville: 'Sotteville-lès-Rouen',
    codePostal: '76300',
    telephone: '02 32 95 18 64',
    email: 'cra@ch-lerouvray.fr',
    siteWeb: 'http://cra-normandie-seine-eure.fr/',
    specialisation: 'Diagnostic, recherche, aide, soutien, information, formation, conseil et expertise auprès des familles et des professionnels.',
    publicConcerne: 'Enfants, adolescents, adultes, professionnels, associations, étudiants',
    horaires: 'Standard téléphonique du lundi au vendredi, 9h-12h et 14h-16h30.'
  },
  {
    nom: 'CRA de Franche-Comté',
    categorie: 'CRA',
    region: 'Bourgogne-Franche-Comté',
    departements: ['25', '39', '70', '90'],
    adresse: '3 rue Victor Sellier',
    ville: 'Besançon',
    codePostal: '25000',
    telephone: '03 81 21 82 44',
    email: 'crafc@chu-besancon.fr',
    siteWeb: 'https://www.cra-franchecomte.fr/',
    specialisation: 'Accueil et conseil, appui aux bilans diagnostiques et évaluations fonctionnelles, documentation, soutien aux professionnels, formation.',
    publicConcerne: 'Tous âges',
    horaires: 'Centre de documentation : 03 81 21 82 58, du lundi au vendredi 9h-12h30 et 14h-17h.'
  },
  {
    nom: 'CRA Bourgogne',
    categorie: 'CRA',
    region: 'Bourgogne-Franche-Comté',
    departements: ['21', '58', '71', '89'],
    adresse: 'Le Clos des Présidents, 19-21 rue René Coty',
    ville: 'Dijon',
    codePostal: '21000',
    telephone: '03 80 29 54 19',
    email: 'cra@crabourgogne.org',
    siteWeb: 'http://www.crabourgogne.org/',
    publicConcerne: 'Enfants, adolescents, adultes'
  },
  {
    nom: 'CRA Champagne-Ardenne',
    categorie: 'CRA',
    region: 'Grand Est',
    departements: ['08', '10', '51', '52'],
    adresse: 'Hôpital Robert Debré, Avenue du Général Kœnig',
    ville: 'Reims',
    codePostal: '51090',
    telephone: '03 26 78 39 67',
    email: 'accueil@cra-champagne-ardenne.fr',
    siteWeb: 'http://www.cra-champagne-ardenne.fr',
    specialisation: 'Accueillir, écouter, informer, conseiller et orienter les publics.',
    publicConcerne: 'Enfants, adolescents, adultes, familles, professionnels, associations',
    horaires: 'Mission diagnostic : mardi, jeudi et vendredi 9h30-16h (Clinique de Champagne, 1 rue de l\'Université, 51100 Reims).'
  },
  {
    nom: 'CRA Lorraine',
    categorie: 'CRA',
    region: 'Grand Est',
    departements: ['54', '55', '57', '88'],
    adresse: '1 rue du Docteur Archambault',
    ville: 'Laxou',
    codePostal: '54520',
    telephone: '03 83 92 66 76',
    email: 'secretariat.ressourcesautisme@cpn-laxou.com',
    siteWeb: 'https://www.cpn-laxou.com/Le-CRA-Lorraine-Centre-de.html',
    horaires: 'Ouvert du lundi au vendredi 9h-12h et 14h-17h. Demandes de diagnostic : mercredi 10h-12h et vendredi 13h30-15h30. Autres demandes : lundi 10h30-12h.'
  },
  {
    nom: 'CRA Alsace',
    categorie: 'CRA',
    region: 'Grand Est',
    departements: ['67', '68'],
    adresse: '13 rue Charles Sandherr',
    ville: 'Colmar',
    codePostal: '68000',
    telephone: '03 89 20 11 95',
    email: 'aida@cra-alsace.net',
    siteWeb: 'http://www.cra-alsace.fr/',
    specialisation: 'Évaluation diagnostique et fonctionnelle des situations complexes, accompagnement des familles, information, sensibilisation, formation.',
    horaires: 'Pôles départementaux : enfants 67 (03 88 11 59 52), enfants 68 (03 89 78 78 10), adultes 67 (03 88 64 57 37), adultes 68 (03 89 24 99 23).'
  },
  {
    nom: 'CRA Pays de la Loire',
    categorie: 'CRA',
    region: 'Pays de la Loire',
    departements: ['44', '49', '53', '72', '85'],
    adresse: 'CHU d\'Angers — Centre Robert Debré, 1er étage, 4 rue Larrey',
    ville: 'Angers',
    codePostal: '49900',
    telephone: '02 41 35 31 21',
    email: 'contact@cra-paysdelaloire.fr',
    siteWeb: 'http://www.cra-paysdelaloire.fr/',
    specialisation: 'Les 10 missions d\'un CRA : accueil, diffusion des recommandations, appui aux bilans, sensibilisation, soutien aux MDPH, recherche, animation du réseau régional.',
    publicConcerne: 'Toute personne concernée ou intéressée par le TSA',
    horaires: 'Standard unique du lundi au vendredi, 9h-12h30 et 13h30-17h. Hémi-région Ouest (44, 85) : contact44@cra-paysdelaloire.fr'
  },
  {
    nom: 'CRA Rhône-Alpes',
    categorie: 'CRA',
    region: 'Auvergne-Rhône-Alpes',
    departements: ['01', '07', '26', '38', '42', '69', '73', '74'],
    adresse: 'Centre Hospitalier le Vinatier, Bât. 211, 95 boulevard Pinel',
    ville: 'Bron',
    codePostal: '69500',
    telephone: '04 37 91 54 65',
    email: 'cra@ch-le-vinatier.fr',
    siteWeb: 'https://www.cra-rhone-alpes.org',
    specialisation: 'Diagnostic de 3ème ligne pour les moins de 3 ans, enfants et adultes.',
    horaires: 'Unités d\'évaluation par département : Bourg-en-Bresse 04 74 52 27 08 · Valence 04 75 85 68 10 · Grenoble 04 76 56 44 04 · Saint-Étienne 04 77 12 79 96 · Chambéry 04 79 60 52 53 · Lyon 04 37 91 52 56.'
  },
  {
    nom: 'CRA Auvergne',
    categorie: 'CRA',
    region: 'Auvergne-Rhône-Alpes',
    departements: ['03', '15', '43', '63'],
    adresse: 'Site Gabriel Montpied, Pôle de psychiatrie, 58 rue Montalembert',
    ville: 'Clermont-Ferrand',
    codePostal: '63000',
    telephone: '04 73 75 19 48',
    email: 'cra-auvergne@chu-clermontferrand.fr',
    siteWeb: 'https://www.cra-auvergne.com',
    specialisation: 'Accueillir, orienter, conseiller. Soutenir la réalisation de diagnostics et d\'évaluations approfondies. Former et informer.',
    publicConcerne: 'Enfants, adolescents, adultes, familles, associations, professionnels',
    horaires: 'Du lundi au vendredi, 9h-17h. Secrétariat : lundi, mardi, jeudi, vendredi 9h-17h.'
  },
  {
    nom: 'CRA Centre-Val de Loire',
    categorie: 'CRA',
    region: 'Centre-Val de Loire',
    departements: ['18', '28', '36', '37', '41', '45'],
    adresse: '2 Boulevard Tonnellé',
    ville: 'Tours',
    codePostal: '37000',
    telephone: '02 47 47 86 46',
    email: 'contact@cra-centre.org',
    siteWeb: 'https://cra-centre.org/',
    publicConcerne: 'Tous publics',
    horaires: 'Enfant : 02 47 47 86 46 · Adulte : 02 18 37 05 46. Du lundi au vendredi, 8h30-12h30 et 13h-16h30.'
  },
  {
    nom: 'CRA Limousin',
    categorie: 'CRA',
    region: 'Nouvelle-Aquitaine',
    departements: ['19', '23', '87'],
    adresse: 'Site du Cluzeau, 23 Avenue Dominique Larrey',
    ville: 'Limoges',
    codePostal: '87000',
    telephone: '05 55 05 89 84',
    email: 'secretariat.cralimousin@chu-limoges.fr',
    siteWeb: 'https://www.cralimousin.com/',
    specialisation: 'Accueil, écoute, information, conseil et orientation. Appui et expertise pour les bilans diagnostiques et fonctionnels.',
    horaires: 'Du lundi au vendredi, 8h30-12h30 et 14h-17h.'
  },
  {
    nom: 'CRA Aquitaine',
    categorie: 'CRA',
    region: 'Nouvelle-Aquitaine',
    departements: ['24', '33', '40', '47', '64'],
    adresse: '121 Rue de la Béchade',
    ville: 'Bordeaux',
    codePostal: '33000',
    telephone: '05 56 56 67 19',
    email: 'cra-aquitaine@ch-perrens.fr',
    siteWeb: 'https://cra.ch-perrens.fr',
    specialisation: 'Centre de diagnostic et centre d\'information autisme. Équipes à Bayonne, Bergerac, Bordeaux, Mont-de-Marsan et Pau.',
    horaires: 'Pôle enfants : 05 56 56 67 19 · Pôle adolescents : 05 33 57 80 49 · Pôle adultes : 05 56 56 67 16 · Antennes Landes/Pyrénées-Atlantiques : 05 56 56 67 39.'
  },
  {
    nom: 'CRAIF — Centre de Ressources Autisme Île-de-France',
    categorie: 'CRA',
    region: 'Île-de-France',
    departements: ['75', '77', '78', '91', '92', '93', '94', '95'],
    adresse: '10 rue Waldeck Rochet',
    ville: 'Aubervilliers',
    codePostal: '93300',
    telephone: '01 49 28 54 20',
    email: 'contact@craif.org',
    siteWeb: 'http://www.craif.org/',
    specialisation: 'Coordination des stratégies d\'intervention et de recherche en Île-de-France. Le CRAIF n\'assure pas directement les soins mais intervient en articulation avec les dispositifs existants.',
    publicConcerne: 'Enfants, adolescents, adultes, familles, professionnels, structures, grand public'
  },
  {
    nom: 'CRA Guadeloupe',
    categorie: 'CRA',
    region: 'Outre-mer',
    departements: ['971'],
    adresse: '39 B Immeuble Névada, Rue Thomas Edison',
    ville: 'Baie-Mahault',
    codePostal: '97122',
    telephone: '05 90 25 23 90',
    email: 'cra-g@epsm-guadeloupe.fr',
    siteWeb: 'https://gncra.fr/cra/cra-guadeloupe/',
    specialisation: 'Structure médico-sociale en autisme. Centre d\'évaluation et d\'information, conseils, documentation.',
    publicConcerne: 'Tous âges'
  },
  {
    nom: 'CRA Martinique',
    categorie: 'CRA',
    region: 'Outre-mer',
    departements: ['972'],
    adresse: 'Immeuble Antares, Chemin Mangot Vulcin',
    ville: 'Le Lamentin',
    codePostal: '97200',
    telephone: '05 96 48 83 60',
    email: 'cra-martinique@ch-despinoy.fr',
    siteWeb: 'https://gncra.fr/cra/cra-martinique/',
    horaires: 'Ouverture au public : lundi 8h-16h30, mardi-jeudi 8h-16h, mercredi 8h-15h, vendredi 8h-13h.'
  },
  {
    nom: 'CRA Guyane Française',
    categorie: 'CRA',
    region: 'Outre-mer',
    departements: ['973'],
    adresse: 'Novaparc VII — Bât. M, 10 rue des Galaxies',
    ville: 'Cayenne',
    codePostal: '97300',
    telephone: '05 94 29 84 24',
    email: 'cr.autisme@ch-cayenne.fr',
    siteWeb: 'https://www.ght-guyane.fr/chc/enseignements/8',
    specialisation: 'Accueil, diagnostic, évaluation, information, formation, documentation, réseau, recherche.',
    horaires: 'Du lundi au jeudi 8h30-16h, vendredi 8h30-13h. Premier accueil avec l\'éducatrice spécialisée sous 15 jours.'
  },
  {
    nom: 'CRA Réunion-Mayotte',
    categorie: 'CRA',
    region: 'Outre-mer',
    departements: ['974', '976'],
    adresse: '14 ruelle Rivière',
    ville: 'Saint-Leu',
    codePostal: '97436',
    telephone: '02 62 22 59 52',
    email: 'secretaire.cra@clairejoie.re',
    siteWeb: 'https://www.cria.re/',
    specialisation: 'Centre ressources inter-régional Réunion-Mayotte. Plateforme inclusive dédiée à l\'autisme et aux TND pour Mayotte.',
    publicConcerne: 'Tous âges',
    horaires: 'Pôle enfant/adolescent : 02 62 22 41 34. Assistante sociale : 06 93 93 84 82. Formation : 06 93 22 65 29.'
  },

  // ─── Structures nationales ───
  {
    nom: 'GNCRA — Groupement National des Centres Ressources Autisme',
    categorie: 'National',
    region: 'France entière',
    departements: [],
    adresse: '10 rue Waldeck Rochet',
    ville: 'Aubervilliers',
    codePostal: '93300',
    siteWeb: 'https://maisondelautisme.gouv.fr/',
    specialisation: 'Tête de réseau nationale des CRA. Outille, structure et harmonise la qualité des services rendus par le réseau des CRA. Créé en 2017 dans le cadre du 3e Plan Autisme.'
  },
  {
    nom: 'CETDAH — Institut Fédératif du Développement',
    categorie: 'Autre',
    region: 'Nouvelle-Aquitaine',
    departements: ['86'],
    adresse: 'Centre hospitalier Laborit — Bâtiment Lagrange, 370 avenue Jacques Cœur',
    ville: 'Poitiers',
    codePostal: '86000',
    telephone: '05 19 99 04 88',
    email: 'secretariat-cetdah@ch-poitiers.fr',
    siteWeb: 'https://ch-laborit.fr/services-de-soins/pedopsychiatrie/ifd/',
    specialisation: 'Spécialisé TDAH : orientation et information, sensibilisation, formation, recherche, diagnostic de niveau 3 et appui aux acteurs de niveau 2.',
    publicConcerne: 'Enfants et adolescents'
  },
  {
    nom: 'Centre de ressources CAA — Équipe et Moi en CAA',
    categorie: 'Autre',
    region: 'Bretagne',
    departements: ['22', '29', '35', '56'],
    telephone: '02 97 82 61 84',
    email: 'equipetmoiencaa@vyv3.fr',
    siteWeb: 'https://equipetmoi.org/caa',
    specialisation: 'Communication Alternative et Améliorée (CAA) : conseil et accompagnement au choix de solutions, avec ou sans matériel. Prêt de matériel possible.',
    publicConcerne: 'Personnes concernées, aidants et professionnels — tous âges'
  },

  // ─── Réseau IntimAgir (vie intime, affective et sexuelle) ───
  {
    nom: 'IntimAgir Île-de-France',
    categorie: 'IntimAgir',
    region: 'Île-de-France',
    departements: ['75', '77', '78', '91', '92', '93', '94', '95'],
    telephone: '06 23 79 14 25',
    email: 'intimagir@creai-idf.fr',
    siteWeb: 'https://www.intimagir-idf.fr/',
    horaires: 'Accueil téléphonique du lundi au vendredi 10h-13h, mardi et jeudi 17h-21h.'
  },
  {
    nom: 'IntimAgir Auvergne-Rhône-Alpes',
    categorie: 'IntimAgir',
    region: 'Auvergne-Rhône-Alpes',
    departements: ['01', '03', '07', '15', '26', '38', '42', '43', '63', '69', '73', '74'],
    telephone: '07 49 88 98 79',
    email: 'handicap@planningfamilialara.com',
    siteWeb: 'https://intimagir-ara.fr/',
    horaires: 'Du lundi au jeudi 9h-17h, vendredi 9h-12h.'
  },
  {
    nom: 'IntimAgir Pays de la Loire',
    categorie: 'IntimAgir',
    region: 'Pays de la Loire',
    departements: ['44', '49', '53', '72', '85'],
    telephone: '08 00 08 11 11',
    email: 'contact@intimagir-paysdelaloire.fr',
    siteWeb: 'https://intimagir-paysdelaloire.fr/',
    horaires: 'Numéro vert gratuit et anonyme, du lundi au samedi 9h-20h.'
  },
  {
    nom: 'IntimAgir Bretagne',
    categorie: 'IntimAgir',
    region: 'Bretagne',
    departements: ['22', '29', '35', '56'],
    telephone: '02 99 29 50 16',
    email: 'intimagir@breizh-sante-handicap.fr',
    siteWeb: 'https://www.intimagir-bretagne.fr/'
  },
  {
    nom: 'IntimAgir Normandie',
    categorie: 'IntimAgir',
    region: 'Normandie',
    departements: ['14', '27', '50', '61', '76'],
    telephone: '07 56 21 40 65',
    siteWeb: 'https://intimagir-normandie.fr/',
    horaires: 'Laisser un message sur le répondeur en précisant le motif, votre nom et vos coordonnées.'
  },
  {
    nom: 'IntimAgir Hauts-de-France',
    categorie: 'IntimAgir',
    region: 'Hauts-de-France',
    departements: ['02', '59', '60', '62', '80'],
    telephone: '03 92 10 05 00',
    email: 'intimagir@creaihdf.org',
    siteWeb: 'https://intimagir-hdf.org/',
    horaires: 'Du lundi au vendredi, 9h-11h et 14h-16h.'
  },
  {
    nom: 'IntimAgir Grand Est',
    categorie: 'IntimAgir',
    region: 'Grand Est',
    departements: ['08', '10', '51', '52', '54', '55', '57', '67', '68', '88'],
    telephone: '06 49 48 17 19',
    email: 'centrederessources@udaf54.com',
    siteWeb: 'https://crhvas-grandest.fr/'
  },
  {
    nom: 'IntimAgir Nouvelle-Aquitaine',
    categorie: 'IntimAgir',
    region: 'Nouvelle-Aquitaine',
    departements: ['16', '17', '19', '23', '33', '40', '47', '64', '79', '86', '87'],
    adresse: '2 rue Ronsard',
    ville: 'Talence',
    codePostal: '33400',
    telephone: '05 56 84 49 90',
    email: 'intimagir-na@apf.asso.fr',
    siteWeb: 'https://intimagir-nouvelle-aquitaine.org/'
  },
  {
    nom: 'IntimAgir Occitanie',
    categorie: 'IntimAgir',
    region: 'Occitanie',
    departements: ['09', '11', '12', '30', '31', '32', '34', '46', '48', '65', '66', '81', '82'],
    telephone: '06 78 23 41 90',
    email: 'cr-intimagir.occitanie@outlook.fr',
    siteWeb: 'https://www.intimagir-occitanie.org/'
  },
  {
    nom: 'IntimAgir PACA',
    categorie: 'IntimAgir',
    region: 'Provence-Alpes-Côte d\'Azur',
    departements: ['04', '05', '06', '13', '83', '84'],
    telephone: '07 82 57 02 85',
    email: 'intimagir@creai-pacacorse.com',
    siteWeb: 'https://www.intimagir-paca.fr/'
  },
  {
    nom: 'IntimAgir Bourgogne-Franche-Comté',
    categorie: 'IntimAgir',
    region: 'Bourgogne-Franche-Comté',
    departements: ['21', '25', '39', '58', '70', '71', '89', '90'],
    telephone: '06 11 59 10 52',
    email: 'intimagir@intimagir-bfc.fr',
    siteWeb: 'https://intimagir-bfc.fr/'
  },
  {
    nom: 'IntimAgir Centre-Val de Loire',
    categorie: 'IntimAgir',
    region: 'Centre-Val de Loire',
    departements: ['18', '28', '36', '37', '41', '45'],
    telephone: '02 47 76 05 08',
    email: 'sandra.masse@apf.asso.fr'
  },
  {
    nom: 'IntimAgir Corse',
    categorie: 'IntimAgir',
    region: 'Corse',
    departements: ['2A', '2B'],
    telephone: '06 99 54 26 88',
    email: 'contact@intimagir-corse.fr',
    siteWeb: 'https://www.intimagir-corse.fr/'
  },
  {
    nom: 'IntimAgir La Réunion',
    categorie: 'IntimAgir',
    region: 'Outre-mer',
    departements: ['974'],
    telephone: '02 62 25 40 15',
    email: 'centreressourceintimagir974@gmail.com',
    siteWeb: 'https://www.planning-familial.org/fr/le-planning-familial-de-la-reunion-974/le-centre-de-re'
  },
  {
    nom: 'IntimAgir Guyane',
    categorie: 'IntimAgir',
    region: 'Outre-mer',
    departements: ['973'],
    adresse: '48 Pointe de la Madeleine, 2300 Route de la Madeleine',
    ville: 'Cayenne',
    codePostal: '97300',
    telephone: '06 94 28 04 88',
    email: 'capparents-intimagir@groupe-sos.org',
    siteWeb: 'https://intimagir-guyane.org/'
  },
  {
    nom: 'IntimAgir Martinique',
    categorie: 'IntimAgir',
    region: 'Outre-mer',
    departements: ['972'],
    adresse: 'Centre commercial Dillon FAG, Route de Chateauboeuf',
    ville: 'Fort-de-France',
    codePostal: '97200',
    telephone: '05 96 56 54 46',
    email: 'crepss972@orange.fr',
    siteWeb: 'https://www.crepssmartinique.fr/centre-de-ressources-handicap-sexualites-parentalites/'
  }
]

export const DESCRIPTION_INTIMAGIR = 'Les centres IntimAgir accompagnent toute personne en situation de handicap, ainsi que ses proches et les professionnels, sur les questions de vie intime, affective et sexuelle, de violences sexistes et sexuelles, et de soutien à la parentalité.'
