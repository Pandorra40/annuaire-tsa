import { requireAdmin } from '~~/server/utils/auth'
import { apiError } from '~~/server/utils/errors'
import { tsaLog } from '~~/server/utils/request'
import { setMaintenanceState } from '~~/server/utils/maintenance'
import { MAINTENANCE_MESSAGE_MAX } from '~~/server/utils/maintenanceShared'
import { validateLength } from '~~/server/utils/validators'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = (await readBody<Record<string, unknown>>(event)) ?? {}
  if (typeof body.actif !== 'boolean') {
    apiError(400, 'Le champ actif (booléen) est obligatoire.')
  }

  if (body.message != null) {
    const brut = String(body.message).replace(/<[^>]*>/g, '').trim()
    if (brut !== '') validateLength(brut, MAINTENANCE_MESSAGE_MAX, 'message')
  }

  try {
    const state = await setMaintenanceState(body.actif, body.message)
    tsaLog('maintenance', `actif=${state.actif ? '1' : '0'}`, event)
    return state
  } catch (e) {
    tsaLog('maintenance', `set=${e instanceof Error ? e.message : String(e)}`)
    apiError(500, 'Impossible d\'enregistrer le mode maintenance')
  }
})
