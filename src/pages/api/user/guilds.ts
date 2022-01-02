import { fetchPremiumGuilds } from "@/lib/aether"
import { AuthenticatedApiHandler, GetGuildsResponse } from "@/types"
import { error, withSession } from "@/utils/api-handler-utils"
import { createErrorResponse } from "@/utils/fetcher"

const handler: AuthenticatedApiHandler<GetGuildsResponse> = async (session, req, res) => {
  if (!req.query.sessionId) {
    error(res, 400, "Missing Session ID")
    return
  }
  try {
    const premiumGuilds = await fetchPremiumGuilds(session.accessToken, req.query.sessionId.toString())
    res.json(premiumGuilds)
  } catch (e: any) {
    const errorResponse = createErrorResponse(e)
    if (!errorResponse.error.includes("No Subscription Found")) {
      error(res, errorResponse.code, errorResponse.error)
      return
    } else return res.json([])
  }
}

export default withSession(handler)
