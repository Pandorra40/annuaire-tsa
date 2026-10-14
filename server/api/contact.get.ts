import { getQuery } from 'h3'
import { pageDesactivation } from '~~/server/utils/contactHelpers'

export default defineEventHandler((event) => {
  const token = String(getQuery(event).desactiver ?? '').trim()
  if (!/^[a-f0-9]{32}$/.test(token)) {
    pageDesactivation(event, 'invalide')
    return
  }
  pageDesactivation(event, 'confirmer', token)
})
