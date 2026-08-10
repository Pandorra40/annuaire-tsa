export const TYPES_PRATICIENS = ['Psychiatre', 'Pédopsychiatre', 'Psychologue', 'Neuropsychologue', 'Orthophoniste', 'Ergothérapeute', 'Psychomotricien', 'Structure'] as const
export const AGES_OPTIONS = ['Enfant', 'Adolescent', 'Adulte'] as const

// Demande d'effacement émanant du praticien lui-même (art. 17 RGPD) : à traiter en
// priorité, contrairement aux signalements communautaires. La même chaîne est reprise
// telle quelle dans api/signalements.php — toute modification doit l'être des deux côtés.
export const MOTIF_RETRAIT = 'Je suis ce praticien et je demande le retrait de ma fiche'

export interface Praticien {
  id: number
  nom: string
  type: string
  ville: string
  departement: string
  adresse?: string
  telephone?: string
  site_web?: string
  teleconsultation: boolean
  delai?: string
  ages: string[]
  notes?: string
  adeli?: string
  confirmations: number
  created_at?: string
  // Vrai si le praticien a consenti au formulaire de contact. L'API ne publie
  // que ce booléen : son adresse email reste sur le serveur.
  contact_actif?: boolean
}

export interface MessageContact {
  praticien_id: number
  nom: string
  email: string
  message: string
  hp: string
  elapsed: number
}

export interface Livre {
  id: number
  titre: string
  auteur: string
  annee?: number
  categorie?: string
  description?: string
  lien?: string
  type: string
}

// Les catégories classent les ressources par position d'énonciation — depuis un
// savoir clinique, depuis un vécu, depuis l'entourage — et non par thème : c'est la
// première question que se pose une famille devant une vidéo sur l'autisme.
// Jamais le mot « amateur » : une personne autiste qui documente son parcours n'en
// est pas une.
export const CATEGORIES_VIDEOS = [
  { id: 'professionnels', label: 'Professionnels' },
  { id: 'concernees', label: 'Personnes concernées' },
  { id: 'familles', label: 'Familles et proches' }
] as const

export interface Video {
  id: number
  // 'video' : lue sur place après clic. 'chaine' : simple lien sortant, parce que
  // recommander une chaîne n'est pas recommander sa dernière vidéo.
  type: 'video' | 'chaine'
  titre: string
  chaine: string
  youtube_id?: string | null
  url?: string | null
  categorie: string
  duree?: string | null
  pourquoi: string
  created_at?: string
}

export interface SuggestionPraticien {
  nom: string
  type: string
  ville: string
  departement: string
  telephone?: string | null
  site_web?: string | null
  notes?: string | null
  adeli?: string | null
  ages: string[]
  statut: string
  source: string
}

// Reprend les valeurs déjà présentes dans la table `associations`, et reprises
// telles quelles par api/suggestions_associations.php — toute modification doit
// l'être des deux côtés.
export const TYPES_ASSOCIATION = [
  'Association de familles',
  'Association de personnes concernées',
  'Association de professionnels'
] as const

export interface SuggestionAssociation {
  nom: string
  type_association?: string | null
  ville: string
  departement: string
  adresse?: string | null
  telephone?: string | null
  email?: string | null
  site_web?: string | null
  services?: string | null
  age_public?: string | null
  description?: string | null
  hp: string
}

export interface Association {
  id: number
  nom: string
  type_association?: string
  ville: string
  departement: string
  adresse?: string
  telephone?: string
  email?: string
  site_web?: string
  services?: string
  age_public?: string
  description?: string
  created_at?: string
}

export interface SuggestionLivre {
  titre: string
  auteur: string
  annee?: number | null
  categorie?: string | null
  description?: string | null
  lien?: string | null
}
