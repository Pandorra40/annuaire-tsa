import { getMaintenanceState } from '~~/server/utils/maintenance'

/** État public du mode maintenance (lu par la page /maintenance et le front). */
export default defineEventHandler(async () => {
  return await getMaintenanceState()
})
