import { validateLength } from '~~/server/utils/validators'

const RUBRIQUES = {
  types_intervention: { max: 1500, nom: 'types d\'intervention' },
  bilans: { max: 1000, nom: 'bilans' },
  formations: { max: 1000, nom: 'formations complémentaires' },
  experience: { max: 1500, nom: 'expérience' },
  modalites: { max: 800, nom: 'modalités' },
  tarifs: { max: 500, nom: 'tarifs' },
  autres_infos: { max: 2000, nom: 'autres informations' }
} as const

export function parseRubriquesPraticien(data: Record<string, unknown>): Record<string, string | null> {
  const valeurs: Record<string, string | null> = {}
  for (const [colonne, r] of Object.entries(RUBRIQUES)) {
    const valeur = String(data[colonne] ?? '')
      .replace(/<[^>]*>/g, '')
      .trim()
    if (valeur === '') {
      valeurs[colonne] = null
      continue
    }
    validateLength(valeur, r.max, r.nom)
    valeurs[colonne] = valeur
  }
  return valeurs
}
