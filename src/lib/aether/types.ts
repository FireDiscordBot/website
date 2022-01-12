import { Session } from "next-auth"

export interface AetherSession {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  clientInfo: any
  ip: string
  readyState: number
  sessionId: string
}

export interface AetherClientPayloads {
  [AetherClientOpcode.IDENTIFY_CLIENT]: {
    config: {
      subscribed: string
      session: Session & {
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
  [AetherServerOpcode.HELLO]: {
    // TODO: add typings
    guildExperiments: never
    userExperiments: never
    commandCategories: string[]
    firstCategory: never
    sessionId: string
    interval: number
  }
  [AetherServerOpcode.HEARTBEAT_ACK]: null
  [AetherServerOpcode.SESSIONS_REPLACE]: AetherSession[]
  [AetherServerOpcode.PUSH_ROUTE]: {
    route: string
  }
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
