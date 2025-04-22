import { APIUser, AuthorizationInfo, DiscordGuild, PartialOAuthUser } from "@/interfaces/discord"

export type ShardStats = {
  id: number
  wsPing: number
  guilds: number
  unavailableGuilds: number
  status: number
}

export type ClusterStats =
  | {
      id: number
      name: string
      env: string
      user: string
      userId: string
      uptime: string
      //   started: string
      cpu: number
      //   ram: string
      ramBytes: number
      //   totalRam: string
      totalRamBytes: number
      pid: number
      version: string
      versions: string
      guilds: number
      unavailableGuilds: number
      users: number
      commands: number
      restPing: number
      shards: ShardStats[]
      error: never
    }
  | {
      id: number
      error: boolean
      name: ""
      env: ""
      uptime: ""
      cpu: 0
      ramBytes: 0
      totalRamBytes: 0
      version: ""
      versions: ""
      guilds: 0
      unavailableGuilds: 0
      users: 0
      commands: 0
      restPing: 0
      shards: ShardStats[]
    }

export type InitialStats = {
  id: -1
  clusterCount: number
  shardCount: number
}

export type Command = {
  name: string
  description: string
  usage: string
  aliases: string
  category?: string
  parent?: string
}

export type CategoryFlag = {
  name: string
  description: string
  usage: string
}

export type Category = {
  id: number
  name: string
  commands: Command[]
  flags?: CategoryFlag[]
  Note?: string
}

declare enum Locale {
  Indonesian = "id",
  EnglishUS = "en-US",
  EnglishGB = "en-GB",
  Bulgarian = "bg",
  ChineseCN = "zh-CN",
  ChineseTW = "zh-TW",
  Croatian = "hr",
  Czech = "cs",
  Danish = "da",
  Dutch = "nl",
  Finnish = "fi",
  French = "fr",
  German = "de",
  Greek = "el",
  Hindi = "hi",
  Hungarian = "hu",
  Italian = "it",
  Japanese = "ja",
  Korean = "ko",
  Lithuanian = "lt",
  Norwegian = "no",
  Polish = "pl",
  PortugueseBR = "pt-BR",
  Romanian = "ro",
  Russian = "ru",
  SpanishES = "es-ES",
  SpanishLATAM = "es-419",
  Swedish = "sv-SE",
  Thai = "th",
  Turkish = "tr",
  Ukrainian = "uk",
  Vietnamese = "vi",
}

type LocalizationMap = Partial<Record<Locale, string | null>>

interface APIApplicationCommandOptionChoice<ValueType = number | string> {
  name: string
  name_localizations?: LocalizationMap | null
  value: ValueType
}

export interface CommandsV2Command {
  id: `${string}/${string}` // command id (`Category/id`)
  name: string // command name
  category: string // category name
  description: string // description in default lang (en-US)
  localisedDescription: {
    [k: string]: string
  } // descriptions for all langs
  arguments: {
    name: string
    description: string
    localisedDescription: {
      [k: string]: string
    }
    type: "String" | "Integer" | "Boolean" | "User" | "Channel" | "Role" | "Mentionable" | "Number" | "Attachment"
    required: boolean
    default: any
    autocomplete: boolean
    choices: APIApplicationCommandOptionChoice[]
  }[] // command arguments
  guilds: string[] // guilds where the command is registered
  channel: "guild" | "dm" | null // where the command can be used
  availableViaSlash: boolean // available via slash command
  ownerOnly: boolean // geek only
  superuserOnly: boolean // requires superuser
  moderatorOnly: boolean // requires moderator
  requiresExperiment: { id: number; bucket: number } | null // experiment id and bucket
  hidden: boolean // hidden to non-superusers
  premium: boolean // requires premium
  slashOnly: boolean // slash command only
  ephemeral: boolean // respond as ephemeral
  slashId: string // main slash command id
  slashIds: Record<string, string> // guild-specific slash command ids
  context: string[] // names of context menu cmds
}

export type CommandsUpdateResponse = {
  commands: Command[]
  categories?: string[]
  commandsV2: CommandsV2Command[]
  full: boolean
}

type BadgeType = null | "PARTNERED" | "VERIFIED" | "BOOST_FRIENDS" | "BOOST_GROUPS" | "BOOST_COMMUNITIES"

export interface DiscoverableGuild {
  name: string
  id: string
  //   icon: string
  iconProxy?: string
  //   splash: string
  splashProxy?: string
  vanity: string
  members: number
  badge: BadgeType
  featured: boolean
  shard?: number
  cluster?: number
  key?: number
}

export enum DiscoveryUpdateOp {
  SYNC = 1,
  REMOVE = 2,
  ADD = 3,
  ADD_OR_SYNC = 4,
}

export type UserGuild = DiscordGuild & {
  premium: boolean
}

export type Payload = {
  op: number // opcode
  d?: unknown // data
  s?: number // sequence
  t?: string // type as UPPER_SNAKE_CASE
  n?: string // nonce
}

export enum EventType {
  IDENTIFY_CLIENT,
  RESUME_CLIENT,
  HELLO,
  HEARTBEAT,
  HEARTBEAT_ACK,
  SUBSCRIBE,
  GUILD_CREATE,
  GUILD_DELETE,
  GUILD_SYNC,
  REALTIME_STATS,
  COMMANDS_UPDATE,
  DISCOVERY_UPDATE,
  NOTIFICATION,
  REMINDERS_UPDATE,
  CONFIG_UPDATE,
  GUILD_JOIN_REQUEST,
  DATA_REQUEST,
  PUSH_ROUTE,
  APPLY_EXPERIMENT,
  SCHEMA_VALIDATION_ERROR,
  SESSIONS_REPLACE,
  RESTART_CLUSTER,
  CREATE_VANITY,
  DELETE_VANITY,
  FEATURE_GUILD_ON_DISCOVER,
  REMOVE_FROM_DISCOVERY,
  CLOSE_SESSION,
}

export type Notification = {
  text: string
  severity: "success" | "info" | "warning" | "error"
  horizontal: "left" | "right" | "center"
  vertical: "top" | "bottom"
  autoHideDuration: number
}

export type Reminder = {
  user: string
  text: string
  link: string
  legacy: boolean
  timestamp: number
}

export type UserExperimentBasicData = {
  activeBucket: number
  id: string
  override: boolean
}

export type GuildExperimentBasicData = {
  id: string
  overrides: [string, number][]
}

export type IdentifyResponse = {
  auth?: AuthorizationInfo
  config?: Record<string, unknown>
  experiments: UserExperimentBasicData[]
  guildExperiments: GuildExperimentBasicData[]
  commandCategoriesV2: string[]
  rateLimit: WSRateLimit
  session: string
  sessions: SessionInfo[]
}

export type ResumeResponse = {
  auth?: AuthorizationInfo
  config?: Record<string, unknown>
  experiments: UserExperimentBasicData[]
  guildExperiments: GuildExperimentBasicData[]
  commandCategoriesV2: string[]
  rateLimit: WSRateLimit
  replayed: number
  session: string
  sessions: SessionInfo[]
}

export type SessionInfo = {
  clientInfo: ClientInfo
  readyState: number
  sessionId: string
  ip: string // hashed ip
}

export type ClientInfo = {
  referrer: string
  platform: { name: string; version: string; arch: string }
  browser: { name: string; version: string }
  device: { mobile?: boolean; model?: string }
  userAgent: string
  language: string
}

type UnavailableGuild = { id: string; unavailable: true }

export type GuildSyncResponse =
  | {
      success: false
      code: number
      debug?: string
    }
  | {
      success: true
      guilds: UnavailableGuild[]
    }
  | {
      success: null
    }

interface TreatmentConfig {
  id: number
  label: string
}

export interface ExperimentConfig {
  id: string
  label: string
  kind: "user" | "guild"
  treatments: TreatmentConfig[]
}

export type BuildOverride = {
  id: string
  experiment: string
  treatment: number
  releaseChannel: "development" | "production"
  validForUserIds: string[]
  expiresAt: Date
  hash?: string
}

interface WSRateLimit {
  total: number
  remaining: number
  resetAfter: number
  maxConcurrency: number
}

export type WebsiteGateway = {
  url: string
  limits: {
    connect: WSRateLimit
    connectGlobal: WSRateLimit
    identify?: WSRateLimit
  }
}

export type AdminSessionData = {
  open: boolean
  closeCode: number
  closeData: string
  readyState: number
  replayable?: number
  lastPing?: string
  willKill?: string
  killer: boolean
  identified: boolean
  sessionId: string
  guilds: string[] | DiscordGuild[]
  client: ClientInfo
  ip?: string
  user: PartialOAuthUser | APIUser
  type: "cluster" | "website"
  seq: number
  pid: number
  id: number
}
