import {UserGuild} from "@/interfaces/aether"
import {DiscordApiUser, DiscordFlag, DiscordGuild, flags} from "@/interfaces/discord"
import fetcher from "@/utils/fetcher"
import {messageLinkRegex} from "@/constants";

const MANAGE_GUILD = 0x00000020

export const fetchManageableGuilds = async (accessToken: string): Promise<DiscordGuild[]> => {
  const guilds: DiscordGuild[] = await fetcher("https://discord.com/api/users/@me/guilds", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  return guilds.filter((guild) => {
    return (guild.permissions & MANAGE_GUILD) == MANAGE_GUILD
  })
}

export const getUserImage = (user: DiscordApiUser) => {
  if (user.avatar === null) {
    const defaultAvatarNumber = parseInt(user.discriminator) % 5
    return `https://cdn.discordapp.com/embed/avatars/${defaultAvatarNumber}.png`
  } else {
    const format = user.avatar.startsWith("a_") ? "gif" : "png"
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${format}`
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

  const format = guild.icon.startsWith("a_") ? "gif" : "png"
  return {
    type: "image",
    value: `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${format}`,
  }
}

export const parseFlags = (flagsValue: number, premiumType: number) => {
  const parsedFlags: DiscordFlag[] = []

  if (premiumType > 0) {
    const nitroFlag = flags.find((flag) => flag.key === "nitro")
    if (nitroFlag) parsedFlags.push(nitroFlag)
  }

  while (flagsValue >= 1) {
    const modBits = flagsValue & (~flagsValue + 1)
    const flag = flags.find((flag) => flag.value == modBits)
    if (flag) parsedFlags.push(flag)
    flagsValue ^= modBits
  }

  return parsedFlags
}


export const getMatches = (string: string, index: number) => {
  index || (index = 1); // default to the first capturing group
  var matches = [];
  var match;
  while (match = messageLinkRegex.exec(string)) {
    matches.push(match[index]);
  }
  return matches;
}

const EPOCH = 1420070400000;
const idToBinary = (num: string[]) => {
  let bin = '';
  let high = parseInt(num[0].slice(0, -10)) || 0;
  let low = parseInt(num[0].slice(-10));
  while (low > 0 || high > 0) {
    bin = String(low & 1) + bin;
    low = Math.floor(low / 2);
    if (high > 0) {
      low += 5000000000 * (high % 2);
      high = Math.floor(high / 2);
    }
  }
  return bin;
}

export const getTimestamp = (link: string) => {
  const id = getMatches(link, 4)
  // @ts-ignore
  const binary = idToBinary(id).toString(2).padStart(64, '0')

  return parseInt(binary.substring(0, 42), 2) + EPOCH;
}

