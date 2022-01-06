import { Reminder } from "@/interfaces/aether"
import { GetRemindersResponse } from "@/types"
import { withAuth, AuthenticatedApiHandler } from "@/lib/api/auth"
import { fetchUserReminders } from "@/lib/aether"
import { internalServerError, respondWithError, respondWithSuccess } from "@/lib/api/response"

const handler: AuthenticatedApiHandler<GetRemindersResponse> = async (_req, res, session) => {
  let reminders: Reminder[]

  try {
    reminders = await fetchUserReminders(session.accessToken)
  } catch (e: any) {
    // TODO: handle error
    // const errorResponse = createErrorResponse(e)
    // error(res, errorResponse.code, errorResponse.error)
    respondWithError(res, internalServerError())
    return
  }

  respondWithSuccess(res, reminders)
}

export default withAuth(handler)
