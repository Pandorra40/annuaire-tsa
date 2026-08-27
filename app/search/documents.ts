import type { CentreRessource } from '~/data/cra'
import type { Association, Livre, Praticien, Video } from '~/types/index'
import { normaliserRecherche } from '../utils/recherche'

/** Distance Levenshtein Orama : 1 couvre une faute courante (bordeau → bordeaux). */
export const ORAMA_TOLERANCE = 1
export const ORAMA_RESULT_LIMIT = 200
export const SUGGESTION_LIMIT = 8
export const SUGGESTION_MIN_CHARS = 2

export const SCHEMA_PRATICIEN = {
  id: 'string',
  nom: 'string',
  ville: 'string',
  ville2: 'string',
  departement: 'string',
  departement2: 'string',
  type: 'string',
  texte: 'string'
} as const

export const SCHEMA_ASSOCIATION = {
  id: 'string',
  nom: 'string',
  ville: 'string',
  departement: 'string',
  services: 'string',
  texte: 'string'
} as const

export const SCHEMA_LIVRE = {
  id: 'string',
  titre: 'string',
  auteur: 'string',
  categorie: 'string',
  texte: 'string'
} as const

export const SCHEMA_VIDEO = {
  id: 'string',
  titre: 'string',
  chaine: 'string',
  pourquoi: 'string',
  texte: 'string'
} as const

export const SCHEMA_CRA = {
  id: 'string',
  nom: 'string',
  region: 'string',
  ville: 'string',
  departements: 'string',
  texte: 'string'
} as const

export const PRATICIEN_SEARCH_PROPERTIES = ['nom', 'ville', 'ville2', 'departement', 'departement2', 'type', 'texte'] as const
export const ASSOCIATION_SEARCH_PROPERTIES = ['nom', 'ville', 'departement', 'services', 'texte'] as const
export const LIVRE_SEARCH_PROPERTIES = ['titre', 'auteur', 'categorie', 'texte'] as const
export const VIDEO_SEARCH_PROPERTIES = ['titre', 'chaine', 'pourquoi', 'texte'] as const
export const CRA_SEARCH_PROPERTIES = ['nom', 'region', 'ville', 'departements', 'texte'] as const

export interface SuggestionRecherche {
  label: string
  value: string
}

function joindre(...parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

export function idPraticien(p: Praticien) {
  return String(p.id)
}

export function docPraticien(p: Praticien) {
  return {
    id: idPraticien(p),
    nom: p.nom,
    ville: p.ville,
    ville2: p.ville2 ?? '',
    departement: p.departement,
    departement2: p.departement2 ?? '',
    type: p.type,
    texte: joindre(
      p.adresse,
      p.types_intervention,
      p.bilans,
      p.formations,
      p.experience,
      p.modalites,
      p.tarifs,
      p.autres_infos
    )
  }
}

export function idAssociation(a: Association) {
  return String(a.id)
}

export function docAssociation(a: Association) {
  return {
    id: idAssociation(a),
    nom: a.nom,
    ville: a.ville,
    departement: a.departement,
    services: a.services ?? '',
    texte: joindre(a.description, a.age_public, a.adresse)
  }
}

export function idLivre(l: Livre) {
  return String(l.id)
}

export function docLivre(l: Livre) {
  return {
    id: idLivre(l),
    titre: l.titre,
    auteur: l.auteur,
    categorie: l.categorie ?? '',
    texte: l.description ?? ''
  }
}

export function idVideo(v: Video) {
  return String(v.id)
}

export function docVideo(v: Video) {
  return {
    id: idVideo(v),
    titre: v.titre,
    chaine: v.chaine,
    pourquoi: v.pourquoi,
    texte: joindre(v.titre, v.chaine, v.pourquoi)
  }
}

export function idCra(c: CentreRessource, index: number) {
  return `${index}-${normaliserRecherche(c.nom).replace(/\s+/g, '-')}`
}

export function docCra(c: CentreRessource, index: number) {
  return {
    id: idCra(c, index),
    nom: c.nom,
    region: c.region,
    ville: c.ville ?? '',
    departements: c.departements.join(' '),
    texte: joindre(c.specialisation, c.adresse, c.publicConcerne)
  }
}

/** Suggestions lisibles pour l'autocomplétion, dédupliquées. */
export function suggestionsDepuisHits(
  hits: Array<{ document: Record<string, string> }>,
  term: string,
  candidats: (doc: Record<string, string>) => Array<{ label: string, value: string }>
): SuggestionRecherche[] {
  const q = normaliserRecherche(term)
  if (!q) return []

  const vus = new Set<string>()
  const out: SuggestionRecherche[] = []

  for (const hit of hits) {
    for (const sug of candidats(hit.document)) {
      const cle = `${sug.label}|${sug.value}`
      if (vus.has(cle)) continue
      if (!normaliserRecherche(sug.label).includes(q) && !normaliserRecherche(sug.value).includes(q)) continue
      vus.add(cle)
      out.push(sug)
      if (out.length >= SUGGESTION_LIMIT) return out
    }
  }

  return out
}

export function suggestionsPraticien(doc: Record<string, string>): SuggestionRecherche[] {
  const s: SuggestionRecherche[] = []
  if (doc.ville) s.push({ label: `${doc.ville} (${doc.departement})`, value: doc.ville })
  if (doc.ville2) s.push({ label: `${doc.ville2} (${doc.departement2})`, value: doc.ville2 })
  if (doc.nom) s.push({ label: doc.nom, value: doc.nom })
  if (doc.departement) s.push({ label: `Département ${doc.departement}`, value: doc.departement })
  return s
}

export function suggestionsAssociation(doc: Record<string, string>): SuggestionRecherche[] {
  const s: SuggestionRecherche[] = []
  if (doc.nom) s.push({ label: doc.nom, value: doc.nom })
  if (doc.ville) s.push({ label: `${doc.ville} (${doc.departement})`, value: doc.ville })
  if (doc.departement) s.push({ label: `Département ${doc.departement}`, value: doc.departement })
  return s
}

export function suggestionsLivre(doc: Record<string, string>): SuggestionRecherche[] {
  const s: SuggestionRecherche[] = []
  if (doc.titre) s.push({ label: doc.titre, value: doc.titre })
  if (doc.auteur) s.push({ label: doc.auteur, value: doc.auteur })
  return s
}

export function suggestionsVideo(doc: Record<string, string>): SuggestionRecherche[] {
  const s: SuggestionRecherche[] = []
  if (doc.titre) s.push({ label: doc.titre, value: doc.titre })
  if (doc.chaine) s.push({ label: doc.chaine, value: doc.chaine })
  return s
}

export function suggestionsCra(doc: Record<string, string>): SuggestionRecherche[] {
  const s: SuggestionRecherche[] = []
  if (doc.nom) s.push({ label: doc.nom, value: doc.nom })
  if (doc.region) s.push({ label: doc.region, value: doc.region })
  if (doc.ville) s.push({ label: doc.ville, value: doc.ville })
  return s
}
