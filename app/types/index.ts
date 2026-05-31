export const TYPES_PRATICIENS = ['Psychiatre', 'Pédopsychiatre', 'Psychologue', 'Neuropsychologue', 'Orthophoniste', 'Ergothérapeute', 'Psychomotricien'] as const
export const AGES_OPTIONS = ['Enfant', 'Adolescent', 'Adulte'] as const

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
