import { Session } from "next-auth"

import { ClusterStats, Command, InitialStats } from "@/interfaces/aether"
import { DiscordGuild } from "@/interfaces/discord"

export interface AetherSession {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  clientInfo: any
  ip: string
  readyState: number
  sessionId: string
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

interface UnavailableGuild {
  id: string
  unavailable: true
}

export interface AetherClientPayloads {
  [AetherClientOpcode.IDENTIFY_CLIENT]: {
    config: {
      subscribed: string
      session?: Session & {
        // Workaround for the current schema in Aether
        // TODO: ask Geek to change schema
        user: {
          name: string
          image: string | null
        }
      }
      // We don't need typings for this object
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      client: any
    }
    env: string
  }
  [AetherClientOpcode.HEARTBEAT]: number | null
  [AetherClientOpcode.GUILD_SYNC]: {
    existing?: DiscordGuild[]
  }
  [AetherClientOpcode.SUBSCRIBE]: {
    route: string
  }
}

export interface AetherServerPayloads {
  [AetherServerOpcode.IDENTIFY_CLIENT]: {
    auth: {
      // TODO: add typings
      user: any
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    config: Record<string, any>
    session: string
    sessions: AetherSession[]
  }
  [AetherServerOpcode.RESUME_CLIENT]: {
    auth: {
      // TODO: add typings
      user: any
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    config: Record<string, any>
    replayed: number
    guilds: UnavailableGuild[]
    session: string
  }
  [AetherServerOpcode.HELLO]: {
    // TODO: add typings
    guildExperiments: ExperimentConfig[]
    userExperiments: ExperimentConfig[]
    commandCategories: string[]
    firstCategory: Command[]
    sessionId: string
    interval: number
  }
  [AetherServerOpcode.HEARTBEAT_ACK]: null
  [AetherServerOpcode.SESSIONS_REPLACE]: AetherSession[]
  [AetherServerOpcode.PUSH_ROUTE]: {
    route: string
  }
  [AetherServerOpcode.GUILD_SYNC]:
    | { success: false; code: number } // error occured
    | { success: true; guilds: UnavailableGuild[] } // success
    | { success: null } // finished guild sync
  [AetherServerOpcode.GUILD_CREATE]: DiscordGuild
  [AetherServerOpcode.GUILD_DELETE]: {
    id: string
  }
  [AetherServerOpcode.REALTIME_STATS]: ClusterStats | InitialStats
}

export enum AetherClientOpcode {
  IDENTIFY_CLIENT = 0,
  HEARTBEAT = 3,
  SUBSCRIBE = 5,
  GUILD_SYNC = 8,
  GUILD_JOIN_REQUEST = 15,
  DATA_REQUEST = 16,
  APPLY_EXPERIMENT = 18,
  RESTART_CLUSTER = 21,
}

export enum AetherServerOpcode {
  IDENTIFY_CLIENT = 0,
  RESUME_CLIENT = 1,
  HELLO = 2,
  HEARTBEAT_ACK = 4,
  GUILD_CREATE = 6,
  GUILD_DELETE = 7,
  GUILD_SYNC = 8,
  REALTIME_STATS = 9,
  COMMANDS_UPDATE = 10,
  DISCOVERY_UPDATE = 11,
  NOTIFICATION = 12,
  REMINDERS_UPDATE = 13,
  CONFIG_UPDATE = 14,
  PUSH_ROUTE = 17,
  SCHEMA_VALIDATION_ERROR = 19,
  SESSIONS_REPLACE = 20,
}

type AetherMessage<Payloads> = {
  [key in keyof Payloads]: {
    op: key
    d: Payloads[key]
    s?: number
  }
}[keyof Payloads]

export type AetherClientMessage = AetherMessage<AetherClientPayloads>

export type AetherServerMessage = AetherMessage<AetherServerPayloads>

export enum AetherCloseCode {
  INVALID_PAYLOAD = 1007,
  INCOMPATIBLE_ENVIRONMENT = 1008,
  SHUTTING_DOWN = 1012,
  TOO_MANY_CONNECTIONS = 1013,
  UNKNOWN_ERROR = 4000,
  MISMATCHED_IDENTITY = 4001,
  MISSING_REQUIRED_SCOPES = 4003,
  HEARTBEAT_EXPIRED = 4004,
  INVALID_SESSION = 4005,
  SESSION_TIMEOUT = 4009,
  INVALID_CONNECTION_DETAILS = 4012,
  CONNECTED_ANOTHER_SESSION = 4015,
  CONNECTED_ANOTHER_LOCATION = 4016,
  DAILY_IDENTIFY_LIMIT_EXCEEDED = 4020,
  SESSION_CONNECTIONS_EXCEEDED = 4029,
  INTERNAL_SERVER_ERROR = 4999,
}

export interface AetherGateway {
  url: string
}
