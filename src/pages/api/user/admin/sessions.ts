import { AdminSessionData } from "@/interfaces/aether"
import { getSessions } from "@/lib/aether/api"
import { AuthenticatedApiHandler, withAuth } from "@/lib/api/auth"
import { internalServerError, methodNotAllowed, respondWithError, respondWithSuccess } from "@/lib/api/response"
import { AnyObject } from "@/types"

const handler: AuthenticatedApiHandler<AdminSessionData[] | AnyObject> = async (req, res, session) => {
  if (req.method !== "GET") {
    respondWithError(res, methodNotAllowed())
    return
  }

  try {
    const data = await getSessions(session.accessToken)
    respondWithSuccess(res, data)
  } catch (err) {
    // TODO: handle errors
    respondWithError(res, internalServerError())
    // if (err instanceof NetworkError && typeof err.data != "undefined") {
    //   typeof err.data == "object" ? res.status(err.code).json(err.data) : res.status(err.code).send(err.data)
    // } else throw err
  }
}

export default withAuth(handler)
