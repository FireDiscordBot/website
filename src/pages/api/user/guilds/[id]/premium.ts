import { getReasonPhrase, StatusCodes } from "http-status-codes"

import { toggleGuildPremium } from "@/lib/aether"
import { ApiErrorResponse, AuthenticatedApiHandler, PutTogglePremiumGuildResponse } from "@/types"
import { error, withSession } from "@/utils/api-handler-utils"
import { NetworkError } from "@/utils/fetcher"

const handler: AuthenticatedApiHandler<PutTogglePremiumGuildResponse> = async (session, req, res) => {
  if (req.method != "PUT") {
    error(res, StatusCodes.BAD_REQUEST)
    return
  }

  const guildId = req.query.id

  if (typeof guildId !== "string") {
    error(res, StatusCodes.BAD_REQUEST)
    return
  }

  try {
    const premiumGuilds = await toggleGuildPremium(session.accessToken, guildId)

    res.json(premiumGuilds)
  } catch (e) {
    if (e instanceof NetworkError && typeof e.data == "object") {
      const response = e.data as ApiErrorResponse | null
      error(res, e.code, response?.error ?? getReasonPhrase(e.code))
    } else {
      error(res, StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }
}

export default withSession(handler)
