import { requestDataArchive, fetchLastDataArchive } from "@/lib/aether/api"
import { DataArchiveRequest, LastDataArchive } from "@/lib/aether/types"
import { AuthenticatedApiHandler, withAuth } from "@/lib/api/auth"
import { ApiErrorResponse, methodNotAllowed, respondWithError, respondWithSuccess } from "@/lib/api/response"
import { AnyObject } from "@/types"
import { NetworkError } from "@/utils/fetcher"

const handler: AuthenticatedApiHandler<DataArchiveRequest | LastDataArchive | AnyObject> = async (
  req,
  res,
  session,
) => {
  if (req.method !== "POST" && req.method !== "GET") {
    respondWithError(res, methodNotAllowed())
    return
  }

  try {
    if (req.method === "POST") {
      const data = await requestDataArchive(session.accessToken)
      respondWithSuccess(res, data)
    } else if (req.method === "GET") {
      const data = await fetchLastDataArchive(session.accessToken)
      respondWithSuccess(res, data)
    }
  } catch (err) {
    if (err instanceof NetworkError && typeof err.data != "undefined") {
      if (typeof err.data == "object") {
        // TODO: better error response
        respondWithError(res, err.data as unknown as ApiErrorResponse)
      } else {
        res.status(err.code).send(err.data)
      }
    } else {
      throw err
    }
  }
}

export default withAuth(handler)
