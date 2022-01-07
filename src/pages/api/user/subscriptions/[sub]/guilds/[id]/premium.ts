import { toggleGuildPremium } from "@/lib/aether"
import { AuthenticatedApiHandler, withAuth } from "@/lib/api/auth"
import {
  badRequest,
  internalServerError,
  methodNotAllowed,
  respondWithError,
  respondWithSuccess,
} from "@/lib/api/response"
import { PutTogglePremiumGuildResponse } from "@/types"

const handler: AuthenticatedApiHandler<PutTogglePremiumGuildResponse> = async (req, res, session) => {
  if (req.method !== "PUT" && req.method !== "DELETE") {
    respondWithError(res, methodNotAllowed())
    return
  }

  const guildId = req.query.id
  const subId = req.query.sub

  if (typeof guildId !== "string" || typeof subId !== "string") {
    respondWithError(res, badRequest())
    return
  }

  try {
    const premiumGuilds = await toggleGuildPremium(session.accessToken, subId, guildId, req.method)

    respondWithSuccess(res, premiumGuilds)
  } catch (e) {
    // const errorResponse = createErrorResponse(e)
    // error(res, errorResponse.code, errorResponse.error)
    // TODO: handle errors
    respondWithError(res, internalServerError())
  }
}

export default withAuth(handler)
