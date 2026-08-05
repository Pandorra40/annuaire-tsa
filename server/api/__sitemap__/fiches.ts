// Alimente le sitemap avec les fiches dynamiques (praticiens, associations,
// départements). Ces pages sont pré-rendues via le hook nitro:config.
export default defineEventHandler(async () => {
  const base = 'https://www.annuaire-tsa.fr/api'

  try {
    const [praticiens, associations] = await Promise.all([
      $fetch<{ id: number, departement: string }[]>(`${base}/praticiens.php`),
      $fetch<{ id: number }[]>(`${base}/associations.php`)
    ])

    const departements = [...new Set(praticiens.map(p => p.departement))].filter(Boolean)

    return [
      ...departements.map(dep => ({ loc: `/departement/${dep}`, changefreq: 'weekly', priority: 0.7 })),
      ...praticiens.map(p => ({ loc: `/praticien/${p.id}`, changefreq: 'monthly', priority: 0.6 })),
      ...associations.map(a => ({ loc: `/association/${a.id}`, changefreq: 'monthly', priority: 0.5 }))
    ]
  } catch {
    return []
  }
})
