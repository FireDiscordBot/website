import { createUserReminder } from "@/lib/aether/api"
import { AuthenticatedApiHandler, withAuth } from "@/lib/api/auth"
import { badRequest, methodNotAllowed, respondWithError, respondWithSuccess } from "@/lib/api/response"
import { NetworkError } from "@/utils/fetcher"

// TODO: typing
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handler: AuthenticatedApiHandler<any> = async (req, res, session) => {
  if (req.method !== "POST") {
    respondWithError(res, methodNotAllowed())
    return
  }

  // TODO: validation
  let body: { reminder: string; timestamp: number }
  try {
    body = JSON.parse(req.body)
  } catch {
    respondWithError(res, badRequest())
    return
  }

  const reminder = await createUserReminder(session.accessToken, req.body).catch((e) => e)
  if (reminder instanceof NetworkError) {
    // TODO: handle this better
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return res.status(reminder.code).json(reminder.data as any)
  }

  respondWithSuccess(res, body)
}

export default withAuth(handler)
