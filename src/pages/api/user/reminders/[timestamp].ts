import { deleteUserReminder } from "@/lib/aether"
import { withAuth, AuthenticatedApiHandler } from "@/lib/api/auth"
import { NetworkError } from "@/utils/fetcher"
import { badRequest, respondWithError, respondWithSuccess } from "@/lib/api/response"

const handler: AuthenticatedApiHandler<null> = async (req, res, session) => {
  if (!req.query.timestamp || parseInt(req.query.timestamp as string) < +new Date()) {
    respondWithError(
      res,
      badRequest(parseInt(req.query.timestamp as string) < +new Date() ? "Invalid Timestamp" : undefined),
    )
    return
  }

  const deleted = await deleteUserReminder(session.accessToken, req.query.timestamp as string).catch((e) => e)
  if (deleted instanceof NetworkError) return res.status(deleted.code).json(deleted.data as any)
  respondWithSuccess(res, null, 204)
  return
}

export default withAuth(handler)
