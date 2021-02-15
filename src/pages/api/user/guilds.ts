import { NextApiHandler } from "next"
import { getSession } from "next-auth/client"
import { DiscordGuild } from "@/interfaces/discord"
import { fetchManageableGuilds } from "@/utils/discord"

const handler: NextApiHandler<DiscordGuild[]> = async (req, res) => {
  const session = await getSession({ req })
  if (!session?.accessToken) {
    res.status(401)
    return
  }

  const manageableGuilds = await fetchManageableGuilds(session.accessToken)

  res.json(manageableGuilds)
}

export default handler
