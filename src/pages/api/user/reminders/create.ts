import { createUserReminder } from "@/lib/aether"
import { withAuth, AuthenticatedApiHandler } from "@/lib/api/auth"
import { NetworkError } from "@/utils/fetcher"
import { badRequest, methodNotAllowed, respondWithError, respondWithSuccess } from "@/lib/api/response"

// TODO: typing
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
  if (reminder instanceof NetworkError) return res.status(reminder.code).json(reminder.data as any)

  respondWithSuccess(res, body)
}

export default withAuth(handler)
