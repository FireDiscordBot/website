import { APIUser, AuthorizationInfo, DiscordGuild, PartialOAuthUser } from "@/interfaces/discord"

export interface ShardStats {
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

export interface InitialStats {
  id: -1
  clusterCount: number
  shardCount: number
}

export interface Command {
  name: string
  description: string
  usage: string
  aliases: string
  category?: string
  parent?: string
}

export interface CategoryFlag {
  name: string
  description: string
  usage: string
}

export interface Category {
  id: number
  name: string
  commands: Command[]
  flags?: CategoryFlag[]
  Note?: string
}

export interface DiscoverableGuild {
  name: string
  id: string
  icon: string
  splash: string
  vanity: string
  members: number
  featured: boolean
  key?: number
}

export enum DiscoveryUpdateOp {
  SYNC = 1,
  REMOVE = 2,
  ADD = 3,
  ADD_OR_SYNC = 4,
}

export interface UserGuild extends DiscordGuild {
  premium: boolean
}

export interface Payload {
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
}

export interface Notification {
  text: string
  severity: "success" | "info" | "warning" | "error"
  horizontal: "left" | "right" | "center"
  vertical: "top" | "bottom"
  autoHideDuration: number
}

export interface Reminder {
  user: string
  text: string
  link: string
  legacy: boolean
  timestamp: number
}

export interface IdentifyResponse {
  config?: Record<string, unknown>
  guilds?: UnavailableGuild[]
  auth?: AuthorizationInfo
  sessions: SessionInfo[]
  rateLimit: WSRateLimit
  session: string
}

export interface ResumeResponse {
  config: Record<string, unknown>
  guilds: UnavailableGuild[]
  auth?: AuthorizationInfo
  sessions: SessionInfo[]
  rateLimit: WSRateLimit
  replayed: number
  session: string
}

export interface SessionInfo {
  clientInfo: ClientInfo
  readyState: number
  sessionId: string
  ip: string // hashed ip
}

export interface ClientInfo {
  referrer: string
  platform: { name: string; version: string; arch: string }
  browser: { name: string; version: string }
  device: { mobile?: boolean; model?: string }
  userAgent: string
  language: string
}

interface UnavailableGuild {
  id: string
  unavailable: true
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

export interface BuildOverride {
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

export interface WebsiteGateway {
  url: string
  limits: {
    connect: WSRateLimit
    connectGlobal: WSRateLimit
    identify?: WSRateLimit
  }
}

export interface AdminSessionData {
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
