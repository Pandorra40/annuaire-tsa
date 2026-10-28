import { slugVille } from '~/utils/villeSlug'

// Alimente le sitemap avec les pages publiques + fiches dynamiques
// (praticiens, associations, départements non vides, villes ≥ 5 fiches).
export default defineEventHandler(async () => {
  const base = 'https://www.annuaire-tsa.fr/api'

  const pagesStatiques = [
    { loc: '/', changefreq: 'daily', priority: 1 },
    { loc: '/apropos', changefreq: 'monthly', priority: 0.8 },
    { loc: '/associations', changefreq: 'weekly', priority: 0.8 },
    { loc: '/cra', changefreq: 'monthly', priority: 0.9 },
    { loc: '/contact', changefreq: 'yearly', priority: 0.4 },
    { loc: '/mentions', changefreq: 'yearly', priority: 0.3 },
    { loc: '/remerciements', changefreq: 'yearly', priority: 0.3 },
    { loc: '/donnees-praticiens', changefreq: 'yearly', priority: 0.4 },
    { loc: '/ressources/livres', changefreq: 'weekly', priority: 0.6 },
    { loc: '/ressources/videos', changefreq: 'weekly', priority: 0.6 }
  ]

  try {
    const [praticiens, associations] = await Promise.all([
      $fetch<{
        id: number
        ville?: string
        ville2?: string | null
        departement: string
        departement2?: string | null
      }[]>(`${base}/praticiens`),
      $fetch<{ id: number }[]>(`${base}/associations`)
    ])

    const departements = new Set<string>()
    const villes = new Map<string, number>()
    for (const p of praticiens) {
      if (p.departement) departements.add(p.departement)
      if (p.departement2) departements.add(p.departement2)
      for (const v of [p.ville, p.ville2]) {
        if (!v?.trim()) continue
        const s = slugVille(v)
        if (!s) continue
        villes.set(s, (villes.get(s) || 0) + 1)
      }
    }

    const hubsVille = [...villes.entries()]
      .filter(([, n]) => n >= 5)
      .map(([s]) => ({ loc: `/ville/${s}`, changefreq: 'weekly', priority: 0.75 }))

    return [
      ...pagesStatiques,
      ...[...departements].map(dep => ({ loc: `/departement/${dep}`, changefreq: 'weekly', priority: 0.7 })),
      ...hubsVille,
      ...praticiens.map(p => ({ loc: `/praticien/${p.id}`, changefreq: 'monthly', priority: 0.6 })),
      ...associations.map(a => ({ loc: `/association/${a.id}`, changefreq: 'monthly', priority: 0.5 }))
    ]
  } catch {
    return pagesStatiques
  }
})
