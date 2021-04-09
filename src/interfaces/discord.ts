/**
 * https://discord.com/developers/docs/resources/user#user-object-user-structure
 */
export type APIUser = {
  id: string
  username: string
  discriminator: string
  avatar: string
  mfa_enabled: boolean
  locale: string
  verified: boolean
  email: string
  flags: number
  premium_type: number
  public_flags: number
}

export type APIUserPartial = {
  id: string
  username: string
  avatar: string
  discriminator: string
  public_flags: number
}

/**
 * https://discord.com/developers/docs/resources/guild#guild-member-object-guild-member-structure
 */
export type APIMember = {
  user: APIUserPartial
  roles: string[]
  nick?: string
  premium_since?: string // ISO8601 timestamp
  joined_at?: string // ISO8601 timestamp
  pending: boolean
  deaf: boolean
  mute: boolean
  permissions: string
}

export type DiscordGuild = {
  id: string
  name: string
  icon: string
  owner: boolean
  permissions: string
  features: string[]
}

export type DiscordFlag = {
  key: string
  value: number
  name: string
  width?: number
}

export const flags: DiscordFlag[] = [
  {
    key: "nitro",
    value: -1,
    name: "Discord Nitro",
    width: 28,
  },
  {
    key: "employee",
    value: 1 << 0,
    name: "Discord Employee",
  },
  {
    key: "partnered",
    value: 1 << 1,
    name: "Partnered Server Owner",
  },
  {
    key: "hypeSquadEvents",
    value: 1 << 2,
    name: "HypeSquad Events",
  },
  {
    key: "bugHunterOne",
    value: 1 << 3,
    name: "Bug Hunter Level 1",
  },
  {
    key: "houseBravery",
    value: 1 << 6,
    name: "HypeSquad Bravery",
  },
  {
    key: "houseBrilliance",
    value: 1 << 7,
    name: "HypeSquad Brilliance",
  },
  {
    key: "houseBalance",
    value: 1 << 8,
    name: "HypeSquad Balance",
  },
  {
    key: "earlySupporter",
    value: 1 << 9,
    name: "Early Supporter",
    width: 28,
  },
  {
    key: "teamUser",
    value: 1 << 10,
    name: "Team User",
  },
  {
    key: "system",
    value: 1 << 12,
    name: "System",
  },
  {
    key: "bugHunterTwo",
    value: 1 << 14,
    name: "Bug Hunter Level 2",
  },
  {
    key: "verifiedBot",
    value: 1 << 16,
    name: "Verified Bot",
  },
  {
    key: "verifiedBotDeveloper",
    value: 1 << 17,
    name: "Early Verified Bot Developer",
  },
]

export interface Invite {
  code: string
  guild: Guild
  channel: Channel
  approximate_member_count?: number
  approximate_presence_count?: number
}

export interface Channel {
  id: string
  name: string
  type: number
}

export interface Guild {
  id: string
  name: string
  splash?: string
  banner?: string
  description?: string
  icon?: string
  features: string[]
  verification_level: number
  vanity_url_code?: string
  welcome_screen?: WelcomeScreen
}

export interface WelcomeScreen {
  description: string
  welcome_channels: WelcomeChannel[]
}

export interface WelcomeChannel {
  channel_id: string
  description: string
  emoji_id?: string
  emoji_name: string
}
