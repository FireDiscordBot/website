import { StatusCodes } from "http-status-codes"

import { fetchPremiumGuilds } from "@/lib/aether"
import { AuthenticatedApiHandler, GetGuildsResponse } from "@/types"
import { error, withSession } from "@/utils/api-handler-utils"
import { fetchManageableGuilds } from "@/utils/discord"
import { NetworkError } from "@/utils/fetcher"

const handler: AuthenticatedApiHandler<GetGuildsResponse> = async (session, _req, res) => {
  try {
    const [manageableGuilds, premiumGuilds] = await Promise.all([
      fetchManageableGuilds(session.accessToken),
      fetchPremiumGuilds(session.accessToken),
    ])

    const guilds = manageableGuilds.map((manageableGuild) => ({
      ...manageableGuild,
      premium: premiumGuilds.includes(manageableGuild.id),
    }))

    res.json(guilds)
  } catch (e) {
    if (e instanceof NetworkError && e.code) {
      error(res, e.code)
    } else {
      error(res, StatusCodes.INTERNAL_SERVER_ERROR)
    }
  }
}

export default withSession(handler)
