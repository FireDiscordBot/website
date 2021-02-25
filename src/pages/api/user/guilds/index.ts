import { DiscordGuild } from "@/interfaces/discord"
import { fetchPremiumGuilds } from "@/lib/aether"
import { AuthenticatedApiHandler, GetGuildsResponse } from "@/types"
import { error, withSession } from "@/utils/api-handler-utils"
import { fetchManageableGuilds } from "@/utils/discord"
import { createErrorResponse } from "@/utils/fetcher"

const handler: AuthenticatedApiHandler<GetGuildsResponse> = async (session, _req, res) => {
  let manageableGuilds: DiscordGuild[]

  try {
    manageableGuilds = await fetchManageableGuilds(session.accessToken)
  } catch (e) {
    const errorResponse = createErrorResponse(e)
    error(res, errorResponse.code, errorResponse.error)
    return
  }

  let premiumGuilds: string[] = []

  try {
    premiumGuilds = await fetchPremiumGuilds(session.accessToken)
  } catch (e) {
    const errorResponse = createErrorResponse(e)
    if (!errorResponse.error.includes("No Subscription Found")) {
      error(res, errorResponse.code, errorResponse.error)
      return
    }
  }

  const guilds = manageableGuilds.map((manageableGuild) => ({
    ...manageableGuild,
    premium: premiumGuilds.includes(manageableGuild.id),
  }))

  res.json(guilds)
}

export default withSession(handler)
