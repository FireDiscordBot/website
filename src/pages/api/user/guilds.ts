import { fetchPremiumGuilds } from "@/lib/aether/api"
import { AuthenticatedApiHandler, withAuth } from "@/lib/api/auth"
import { badRequest, internalServerError, respondWithError, respondWithSuccess } from "@/lib/api/response"
import { GetGuildsResponse } from "@/types"
import { createErrorResponse } from "@/utils/fetcher"

const handler: AuthenticatedApiHandler<GetGuildsResponse> = async (req, res, session) => {
  if (!req.query.sessionId) {
    respondWithError(res, badRequest("Missing Session ID"))
    return
  }

  try {
    const premiumGuilds = await fetchPremiumGuilds(session.accessToken, req.query.sessionId.toString())
    respondWithSuccess(res, premiumGuilds)
  } catch (err) {
    const errorResponse = createErrorResponse(err as Error)
    if (!errorResponse.message.includes("No Subscription Found")) {
      // TODO: handle errors
      respondWithError(res, internalServerError())
    } else {
      respondWithSuccess(res, [])
    }
  }
}

export default withAuth(handler)
