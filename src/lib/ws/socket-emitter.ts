import { EventEmitter } from "events"

import { Category, FireStats } from "@/interfaces/aether"

interface EmitterEvents {
  REALTIME_STATS: (stats: FireStats) => void
  SUBSCRIBE: (route: string) => void
  HELLO: (hello: { interval: number }) => void
  COMMANDS_UPDATE: (categories: Category[]) => void
}

export declare interface Emitter {
  on<T extends keyof EmitterEvents>(event: T, listener: EmitterEvents[T]): this
  emit<T extends keyof EmitterEvents>(event: T, ...args: Parameters<EmitterEvents[T]>): boolean
}

export class Emitter extends EventEmitter {}
