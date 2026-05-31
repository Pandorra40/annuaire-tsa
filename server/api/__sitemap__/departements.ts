export default defineEventHandler(async () => {
  try {
    const praticiens = await $fetch<{ departement: string }[]>('https://www.annuaire-tsa.fr/api/praticiens.php')
    const deps = [...new Set(praticiens.map(p => p.departement))]
    return deps.map(dep => ({
      loc: `/departement/${dep}`,
      changefreq: 'weekly',
      priority: 0.7
    }))
  } catch {
    return []
  }
})
