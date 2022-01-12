import { deleteUserReminder } from "@/lib/aether/api"
import { AuthenticatedApiHandler, withAuth } from "@/lib/api/auth"
import { badRequest, respondWithError, respondWithSuccess } from "@/lib/api/response"
import { NetworkError } from "@/utils/fetcher"

const handler: AuthenticatedApiHandler<null> = async (req, res, session) => {
  if (!req.query.timestamp || parseInt(req.query.timestamp as string) < +new Date()) {
    respondWithError(
      res,
      badRequest(parseInt(req.query.timestamp as string) < +new Date() ? "Invalid Timestamp" : undefined),
    )
    return
  }

  const deleted = await deleteUserReminder(session.accessToken, req.query.timestamp as string).catch((e) => e)
  if (deleted instanceof NetworkError) {
    // TODO: handle this better
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return res.status(deleted.code).json(deleted.data as any)
  }

  respondWithSuccess(res, null, 204)
  return
}

export default withAuth(handler)
