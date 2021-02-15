import { fetchPremiumGuilds } from "@/lib/aether"
import { NextApiHandler } from "next"
import { getSession } from "next-auth/client"
import { UserGuild } from "@/interfaces/aether"
import { fetchManageableGuilds } from "@/utils/discord"

const handler: NextApiHandler<UserGuild[]> = async (req, res) => {
  const session = await getSession({ req })
  if (!session?.accessToken) {
    res.status(401)
    return
  }

  const [manageableGuilds, premiumGuilds] = await Promise.all([
    fetchManageableGuilds(session.accessToken),
    fetchPremiumGuilds(session.accessToken),
  ])

  const guilds = manageableGuilds.map((manageableGuild) => ({
    ...manageableGuild,
    premium: premiumGuilds.includes(manageableGuild.id),
  }))

  res.json(guilds)
}

export default handler
