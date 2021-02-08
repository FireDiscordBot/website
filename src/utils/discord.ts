import { DiscordApiUser, DiscordGuild } from "@/interfaces/discord"

const MANAGE_GUILD = 0x00000020

export const fetchManageableGuilds = async (accessToken: string): Promise<DiscordGuild[]> => {
  const response = await fetch("https://discord.com/api/users/@me/guilds", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
  const guilds: DiscordGuild[] = await response.json()

  return guilds.filter(guild => {
    return (guild.permissions & MANAGE_GUILD) == MANAGE_GUILD
  })
}

export const getUserImage = (user: DiscordApiUser) => {
  if (user.avatar === null) {
    const defaultAvatarNumber = parseInt(user.discriminator) % 5
    return `https://cdn.discordapp.com/embed/avatars/${defaultAvatarNumber}.png`
  } else {
    const format = user.avatar.startsWith("a_") ? 'gif' : 'png'
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${format}`
  }
}
