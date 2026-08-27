/**
 * Redirige vers /admin/login si aucun jeton n'est en sessionStorage.
 * Confort uniquement : l'API reste la barrière réelle (requireAdmin).
 */
export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) return

  const token = sessionStorage.getItem('admin_token')
  if (!token) {
    return navigateTo('/admin/login')
  }
})
