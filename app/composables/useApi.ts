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
  const base = config.public.apiBase

  async function fetchPraticiens() {
    return await $fetch<Praticien[]>(`${base}/praticiens.php`)
  }

  async function fetchPraticien(id: number) {
    return await $fetch<Praticien[]>(`${base}/praticiens.php?id=${id}`)
  }

  async function fetchPraticiensDepartement(departement: string) {
    return await $fetch<Praticien[]>(`${base}/praticiens.php?departement=${encodeURIComponent(departement)}`)
  }

  async function confirmerFiche(id: number) {
    return await $fetch(`${base}/praticiens.php?id=${id}`, { method: 'PATCH' })
  }

  async function fetchLivres() {
    return await $fetch<Livre[]>(`${base}/livres.php`)
  }

  async function fetchVideos() {
    return await $fetch<Video[]>(`${base}/videos.php`)
  }

  async function suggererPraticien(payload: SuggestionPraticien) {
    return await $fetch(`${base}/suggestions.php`, {
      method: 'POST',
      body: payload
    })
  }

  async function envoyerMessage(payload: MessageContact) {
    return await $fetch(`${base}/contact.php`, {
      method: 'POST',
      body: payload
    })
  }

  async function suggererLivre(payload: SuggestionLivre) {
    return await $fetch(`${base}/suggestions_livres.php`, {
      method: 'POST',
      body: payload
    })
  }

  async function suggererAssociation(payload: SuggestionAssociation) {
    return await $fetch(`${base}/suggestions_associations.php`, {
      method: 'POST',
      body: payload
    })
  }

  async function fetchAssociations() {
    return await $fetch<Association[]>(`${base}/associations.php`)
  }

  async function fetchAssociation(id: number) {
    return await $fetch<Association[]>(`${base}/associations.php?id=${id}`)
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
