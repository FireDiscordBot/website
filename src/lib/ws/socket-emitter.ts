import { EventEmitter } from "events"

import type {
  ClusterStats,
  Command,
  DiscoverableGuild,
  IdentifyResponse,
  InitialStats,
  Notification,
  Reminder,
  ResumeResponse,
  SessionInfo,
} from "@/interfaces/aether"

interface EmitterEvents {
  IDENTIFY_CLIENT: (response: IdentifyResponse) => void
  RESUME_CLIENT: (response: ResumeResponse) => void
  REALTIME_STATS: (stats: ClusterStats | InitialStats) => void
  SUBSCRIBE: (route: string, extra?: unknown) => void
  HELLO: (hello: { interval: number }) => void
  COMMANDS_UPDATE: (update: { commands: Command[]; full: boolean }) => void
  DISCOVERY_UPDATE: (guilds: DiscoverableGuild[]) => void
  NOTIFICATION: (notification?: Notification) => void
  REMINDERS_UPDATE: (reminders: Reminder[]) => void
  CONFIG_UPDATE: (update: { name: string; value: unknown }) => void
  SESSIONS_REPLACE: (sessions: SessionInfo[]) => void
}

export declare interface Emitter {
  on<T extends keyof EmitterEvents>(event: T, listener: EmitterEvents[T]): this
  emit<T extends keyof EmitterEvents>(event: T, ...args: Parameters<EmitterEvents[T]>): boolean
}

export class Emitter extends EventEmitter {}
