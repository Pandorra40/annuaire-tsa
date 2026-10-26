// Nuxt auto-importe les composables et les utilitaires, jamais les types :
// sans cette ligne, les huit types ci-dessous n'existent pas pour TypeScript.
// Les génériques $fetch<Praticien[]> désignaient donc du vide, et toute la
// couche d'accès aux données avait l'air typée sans l'être — une propriété mal
// orthographiée passait sans un mot, ni à l'écriture ni au build.
import type {
  Association,
  Livre,
  MessageContact,
  Praticien,
  SuggestionAssociation,
  SuggestionLivre,
  SuggestionPraticien,
  Video
} from '~/types'

export function useApi() {
  const config = useRuntimeConfig()
  // Au pré-rendu local, /api pointe vers Nitro sans MySQL (ECONNREFUSED :3306)
  // et produit des fiches « introuvable » vides pour les crawlers. Même source
  // que le hook nitro:config qui liste les routes : l’API de production.
  const base = import.meta.prerender
    ? 'https://www.annuaire-tsa.fr/api'
    : config.public.apiBase

  async function fetchPraticiens() {
    return await $fetch<Praticien[]>(`${base}/praticiens`)
  }

  async function fetchPraticien(id: number) {
    return await $fetch<Praticien[]>(`${base}/praticiens?id=${id}`)
  }

  async function fetchPraticiensDepartement(departement: string) {
    return await $fetch<Praticien[]>(`${base}/praticiens?departement=${encodeURIComponent(departement)}`)
  }

  async function confirmerFiche(id: number) {
    return await $fetch<{ ok: boolean, already?: boolean }>(`${base}/praticiens?id=${id}`, {
      method: 'PATCH'
    })
  }

  async function fetchLivres() {
    return await $fetch<Livre[]>(`${base}/livres`)
  }

  async function fetchVideos() {
    return await $fetch<Video[]>(`${base}/videos`)
  }

  // `Omit<…, 'id'>` sur les trois envois de suggestion : l'identifiant est
  // attribué par la base, un formulaire n'en a donc jamais. Le type complet
  // reste exigé partout où l'on relit une suggestion enregistrée, côté admin.
  async function suggererPraticien(payload: Omit<SuggestionPraticien, 'id'>) {
    return await $fetch(`${base}/suggestions`, {
      method: 'POST',
      body: payload
    })
  }

  async function envoyerMessage(payload: MessageContact) {
    return await $fetch(`${base}/contact`, {
      method: 'POST',
      body: payload
    })
  }

  async function suggererLivre(payload: Omit<SuggestionLivre, 'id'>) {
    return await $fetch(`${base}/suggestions-livres`, {
      method: 'POST',
      body: payload
    })
  }

  async function suggererAssociation(payload: Omit<SuggestionAssociation, 'id'>) {
    return await $fetch(`${base}/suggestions-associations`, {
      method: 'POST',
      body: payload
    })
  }

  async function fetchAssociations() {
    return await $fetch<Association[]>(`${base}/associations`)
  }

  async function fetchAssociation(id: number) {
    return await $fetch<Association[]>(`${base}/associations?id=${id}`)
  }

  return {
    fetchPraticiens,
    fetchPraticien,
    fetchPraticiensDepartement,
    confirmerFiche,
    fetchLivres,
    fetchVideos,
    suggererPraticien,
    envoyerMessage,
    suggererLivre,
    suggererAssociation,
    fetchAssociations,
    fetchAssociation
  }
}
