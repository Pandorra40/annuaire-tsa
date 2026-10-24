import { isAdminSession } from '~~/server/utils/auth'
import { getMaintenanceState } from '~~/server/utils/maintenance'
import { isMaintenanceBypassPath } from '~~/server/utils/maintenanceShared'

/**
 * Si la maintenance est active : les visiteurs (hors admin connecté) sont
 * redirigés vers /maintenance ; les API publiques répondent 503.
 * L’admin reste utilisable pour désactiver le mode ou finir une MAJ.
 */
export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname
  if (isMaintenanceBypassPath(path)) return

  let state
  try {
    state = await getMaintenanceState()
  } catch {
    // Pas de BDD → ne pas bloquer tout le site
    return
  }
  if (!state.actif) return

  if (await isAdminSession(event)) return

  setResponseHeader(event, 'Retry-After', '3600')

  if (path.startsWith('/api/')) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Service Unavailable',
      data: { error: 'maintenance', message: state.message }
    })
  }

  return sendRedirect(event, '/maintenance', 302)
})
