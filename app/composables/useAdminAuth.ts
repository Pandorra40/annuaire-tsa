/**
 * Auth admin : cookie HttpOnly (posé par /api/auth) + fetch avec credentials.
 */
export function useAdminAuth() {
  async function adminFetch<T = unknown>(url: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch('/api/' + url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    })

    if (res.status === 401) {
      navigateTo('/admin/login')
      throw new Error('Non authentifié')
    }

    if (!res.ok) {
      const corps = await res.json().catch(() => ({})) as {
        error?: string | boolean
        message?: string
        statusMessage?: string
        data?: { error?: string }
      }
      const msg = (typeof corps.data?.error === 'string' && corps.data.error)
        || (typeof corps.error === 'string' && corps.error)
        || corps.statusMessage
        || corps.message
        || `Erreur ${res.status}`
      throw new Error(msg)
    }

    if (res.status === 204) return {} as T
    return res.json() as Promise<T>
  }

  async function deconnexion() {
    try {
      await adminFetch('auth', { method: 'DELETE' })
    } catch {
      // déconnexion locale malgré tout : le cookie sera effacé côté serveur si possible
    }
    navigateTo('/admin/login')
  }

  return { adminFetch, deconnexion }
}
