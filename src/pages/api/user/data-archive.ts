import { createDataArchive, getDataRequest } from "@/lib/aether"
import { AuthenticatedApiHandler, withAuth } from "@/lib/api/auth"
import { ApiErrorResponse, methodNotAllowed, respondWithError, respondWithSuccess } from "@/lib/api/response"
import { AnyObject, GetCollectData, PostCollectData } from "@/types"
import { NetworkError } from "@/utils/fetcher"

const handler: AuthenticatedApiHandler<PostCollectData | GetCollectData | AnyObject> = async (req, res, session) => {
  if (req.method !== "POST" && req.method !== "GET") {
    respondWithError(res, methodNotAllowed())
    return
  }

  try {
    if (req.method === "POST") {
      const url = await createDataArchive(session.accessToken)
      respondWithSuccess(res, { url })
    } else if (req.method === "GET") {
      const data = await getDataRequest(session.accessToken)
      respondWithSuccess(res, data)
    }
  } catch (err) {
    if (err instanceof NetworkError && typeof err.data != "undefined") {
      if (typeof err.data == "object") {
        // TODO: better error response
        respondWithError(res, err.data as any as ApiErrorResponse)
      } else {
        res.status(err.code).send(err.data)
      }
    } else {
      throw err
    }
  }
}

export default withAuth(handler)
