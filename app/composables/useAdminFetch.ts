export function useAdminFetch() {
  const token = ref('')

  onMounted(() => {
    token.value = sessionStorage.getItem('admin_token') || ''
    if (!token.value) navigateTo('/admin/login')
  })

  async function adminFetch(url: string, options: any = {}) {
    const res = await fetch('/api/' + url, {
      ...options,
      headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token.value, ...options.headers }
    })
    if (res.status === 401) { navigateTo('/admin/login'); throw new Error('Non authentifié') }
    if (!res.ok) throw new Error('Erreur ' + res.status)
    return res.json()
  }

  return { token, adminFetch }
}
