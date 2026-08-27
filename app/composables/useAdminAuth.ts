/**
 * Auth admin : token sessionStorage + fetch vers /api/ avec X-Admin-Token.
 * Centralise la logique dupliquée sur les pages /admin/*.
 */
export function useAdminAuth() {
  const token = ref('')

  function lireToken() {
    if (!import.meta.client) return ''
    token.value = sessionStorage.getItem('admin_token') || ''
    return token.value
  }

  async function adminFetch<T = unknown>(url: string, options: RequestInit = {}): Promise<T> {
    if (!token.value) lireToken()

    const res = await fetch('/api/' + url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Token': token.value,
        ...options.headers
      }
    })

    if (res.status === 401) {
      sessionStorage.removeItem('admin_token')
      token.value = ''
      navigateTo('/admin/login')
      throw new Error('Non authentifié')
    }

    if (!res.ok) {
      const corps = await res.json().catch(() => ({})) as { error?: string }
      throw new Error(corps.error ?? `Erreur ${res.status}`)
    }

    if (res.status === 204) return {} as T
    return res.json() as Promise<T>
  }

  async function deconnexion() {
    try {
      await adminFetch('auth.php', { method: 'DELETE' })
    } catch {
      // déconnexion locale malgré tout : le jeton côté serveur expirera de lui-même
    }
    sessionStorage.removeItem('admin_token')
    token.value = ''
    navigateTo('/admin/login')
  }

  return { token, lireToken, adminFetch, deconnexion }
}
