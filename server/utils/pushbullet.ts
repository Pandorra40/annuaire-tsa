export async function pushbulletNotify(title: string, body: string): Promise<void> {
  const config = useRuntimeConfig()
  const token = String(process.env.PUSHBULLET_TOKEN || config.pushbulletToken || '')
  if (!token) return

  try {
    await $fetch('https://api.pushbullet.com/v2/pushes', {
      method: 'POST',
      headers: {
        'Access-Token': token,
        'Content-Type': 'application/json'
      },
      body: {
        type: 'note',
        title,
        body
      },
      timeout: 5000
    })
  } catch {
    /* notifications best-effort */
  }
}
