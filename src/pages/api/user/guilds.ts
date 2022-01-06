import { fetchPremiumGuilds } from "@/lib/aether"
import { GetGuildsResponse } from "@/types"
import { withAuth, AuthenticatedApiHandler } from "@/lib/api/auth"
import { createErrorResponse } from "@/utils/fetcher"
import { badRequest, internalServerError, respondWithError, respondWithSuccess } from "@/lib/api/response"

const handler: AuthenticatedApiHandler<GetGuildsResponse> = async (req, res, session) => {
  if (!req.query.sessionId) {
    respondWithError(res, badRequest("Missing Session ID"))
    return
  }

  try {
    const premiumGuilds = await fetchPremiumGuilds(session.accessToken, req.query.sessionId.toString())
    respondWithSuccess(res, premiumGuilds)
  } catch (err: any) {
    const errorResponse = createErrorResponse(err)
    if (!errorResponse.message.includes("No Subscription Found")) {
      // TODO: handle errors
      respondWithError(res, internalServerError())
    } else {
      respondWithSuccess(res, [])
    }
  }
}

export default withAuth(handler)
