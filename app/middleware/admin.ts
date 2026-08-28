/**
 * Vérifie la session admin via l'API (cookie HttpOnly, illisible en JS).
 * Confort uniquement : l'API reste la barrière réelle (requireAdmin).
 */
export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) return

  try {
    const res = await fetch('/api/auth.php', { credentials: 'include' })
    if (!res.ok) return navigateTo('/admin/login')
  } catch {
    return navigateTo('/admin/login')
  }
})
