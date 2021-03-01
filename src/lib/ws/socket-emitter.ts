import { EventEmitter } from "events"

import { FireStats } from "@/interfaces/aether"

interface EmitterEvents {
  REALTIME_STATS: (stats: FireStats) => void
  SUBSCRIBE: (route: string) => void
}

export declare interface Emitter {
  on<T extends keyof EmitterEvents>(event: T, listener: EmitterEvents[T]): this
  emit<T extends keyof EmitterEvents>(event: T, ...args: Parameters<EmitterEvents[T]>): boolean
}

export class Emitter extends EventEmitter {}
