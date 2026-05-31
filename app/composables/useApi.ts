export function useApi() {
  const config = useRuntimeConfig()
  const base = config.public.apiBase

  async function fetchPraticiens() {
    return await $fetch<Praticien[]>(`${base}/praticiens.php`)
  }

  async function fetchPraticien(id: number) {
    return await $fetch<Praticien[]>(`${base}/praticiens.php?id=${id}`)
  }

  async function confirmerFiche(id: number) {
    return await $fetch(`${base}/praticiens.php?id=${id}`, { method: 'PATCH' })
  }

  async function fetchLivres() {
    return await $fetch<Livre[]>(`${base}/livres.php`)
  }

  async function suggererPraticien(payload: SuggestionPraticien) {
    return await $fetch(`${base}/suggestions.php`, {
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

  async function fetchAssociations() {
    return await $fetch<Association[]>(`${base}/associations.php`)
  }

  async function fetchAssociation(id: number) {
    return await $fetch<Association[]>(`${base}/associations.php?id=${id}`)
  }

  return {
    fetchPraticiens,
    fetchPraticien,
    confirmerFiche,
    fetchLivres,
    suggererPraticien,
    suggererLivre,
    fetchAssociations,
    fetchAssociation
  }
}
