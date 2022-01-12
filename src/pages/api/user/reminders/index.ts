import type { Reminder } from "@/interfaces/aether"
import { fetchUserReminders } from "@/lib/aether/api"
import { AuthenticatedApiHandler, withAuth } from "@/lib/api/auth"
import { internalServerError, respondWithError, respondWithSuccess } from "@/lib/api/response"
import type { GetRemindersResponse } from "@/types"

const handler: AuthenticatedApiHandler<GetRemindersResponse> = async (_req, res, session) => {
  let reminders: Reminder[]

  try {
    reminders = await fetchUserReminders(session.accessToken)
  } catch (e) {
    // TODO: handle error
    // const errorResponse = createErrorResponse(e)
    // error(res, errorResponse.code, errorResponse.error)
    respondWithError(res, internalServerError())
    return
  }

  respondWithSuccess(res, reminders)
}

export default withAuth(handler)
