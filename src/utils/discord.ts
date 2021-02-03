import {DiscordGuild} from "../interfaces/discord"

const MANAGE_GUILD = 0x00000020

export const fetchManageableGuilds = async (accessToken: string): Promise<DiscordGuild[]> => {
  const response = await fetch("https://discord.com/api/users/@me/guilds", {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })
  const guilds: DiscordGuild[] = await response.json()

  return guilds.filter(guild => {
    return (guild.permissions & MANAGE_GUILD) == MANAGE_GUILD
  })
}