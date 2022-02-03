import { messageLinkRegex } from "@/constants"
import { UserGuild } from "@/interfaces/aether"
import { APIUser, DiscordFlag, DiscordGuild, PartialOAuthUser, flags } from "@/interfaces/discord"
import fetcher from "@/utils/fetcher"

export const fetchGuilds = async (accessToken: string): Promise<DiscordGuild[]> => {
  const guilds: DiscordGuild[] = await fetcher("https://discord.com/api/v9/users/@me/guilds?with_counts=true", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
  if (!guilds) return []

  if (guilds.length == 100) {
    // for the odd chance someone is in over 100
    const moreGuilds: DiscordGuild[] = await fetcher(
      `https://discord.com/api/v9/users/@me/guilds?after=${guilds[guilds.length - 1].id}&with_counts=true`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )
    if (moreGuilds.length) guilds.push(...moreGuilds)
  }

  return guilds
}

const userCache = new Map<string, APIUser>()

export const fetchUser = async (accessToken: string): Promise<APIUser & { cached?: true }> => {
  if (userCache.has(accessToken)) {
    const user = userCache.get(accessToken) as APIUser & { cached?: true }
    user.cached = true
    return user
  }
  const user: APIUser = await fetcher("https://discord.com/api/v9/users/@me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  userCache.set(accessToken, user)
  setTimeout(() => userCache.delete(accessToken), 30000)

  return user
}

export const getAvatarImageUrl = (
  avatar: string | null,
  userId: string,
  userDiscriminator: string,
  useModSix = false,
) => {
  if (typeof avatar !== "string") {
    const defaultAvatarNumber = useModSix ? parseInt(userDiscriminator) % 6 : parseInt(userDiscriminator) % 5
    return `https://cdn.discordapp.com/embed/avatars/${defaultAvatarNumber}.png?ts=${new Date().getTime()}`
  } else {
    const format = avatar.startsWith("a_") ? "gif" : "png"
    return `https://cdn.discordapp.com/avatars/${userId}/${avatar}.${format}`
  }
}

export const getBannerImage = (user: APIUser | PartialOAuthUser) => {
  if (user.banner) {
    const format = user.banner?.startsWith("a_") ? "gif" : "png"
    return `https://cdn.discordapp.com/banners/${user.id}/${user.banner}.${format}?size=1024`
  } else {
    return null
  }
}

export const getGuildIcon = (guild: UserGuild) => {
  if (guild.icon == null) {
    return {
      type: "text",
      value: guild.name
        .split(" ")
        .map((word) => word[0])
        .join(""),
    }
  }

  const format = guild.icon.startsWith("a_") && guild.features.includes("ANIMATED_ICON") ? "gif" : "png"
  return {
    type: "image",
    value: `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${format}`,
  }
}

export const parseFlags = (flagsValue: number, premiumType: number) => {
  const parsedFlags: DiscordFlag[] = []

  while (flagsValue >= 1) {
    const modBits = flagsValue & (~flagsValue + 1)
    const flag = flags.find((flag) => flag.value == modBits)
    if (flag) parsedFlags.push(flag)
    flagsValue ^= modBits
  }

  if (premiumType > 0) {
    const nitroFlag = flags.find((flag) => flag.key === "nitro")
    if (nitroFlag) parsedFlags.push(nitroFlag)
  }

  return parsedFlags.sort((a, b) => flags.indexOf(a) - flags.indexOf(b))
}

export const getMatches = (string: string, index = 1) => {
  const matches = []
  let match
  while ((match = messageLinkRegex.exec(string))) {
    matches.push(match[index])
  }
  return matches
}

const EPOCH = 1420070400000
const idToBinary = (num: string[]) => {
  let bin = ""
  let high = parseInt(num[0].slice(0, -10)) || 0
  let low = parseInt(num[0].slice(-10))
  while (low > 0 || high > 0) {
    bin = String(low & 1) + bin
    low = Math.floor(low / 2)
    if (high > 0) {
      low += 5000000000 * (high % 2)
      high = Math.floor(high / 2)
    }
  }
  return bin
}

export const getTimestamp = (link: string) => {
  const id = getMatches(link, 4)
  const binary = idToBinary(id).toString().padStart(64, "0")

  return parseInt(binary.substring(0, 42), 2) + EPOCH
}