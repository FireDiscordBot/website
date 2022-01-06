import { Reminder } from "@/interfaces/aether"
import { AuthenticatedApiHandler, GetRemindersResponse } from "@/types"
import { error, withSession } from "@/lib/api/api-handler-utils"
import { createErrorResponse } from "@/utils/fetcher"
import { fetchUserReminders } from "@/lib/aether"

const handler: AuthenticatedApiHandler<GetRemindersResponse> = async (session, _req, res) => {
  let reminders: Reminder[]

  try {
    reminders = await fetchUserReminders(session.accessToken)
  } catch (e: any) {
    const errorResponse = createErrorResponse(e)
    error(res, errorResponse.code, errorResponse.error)
    return
  }

  res.json(reminders)
}

export default withSession(handler)
