import { FireStats } from "../interfaces/aether";
import { EventEmitter } from "events";

interface EmitterEvents {
  REALTIME_STATS: (stats: FireStats) => void;
  SUBSCRIBE: (route: string, extra?: unknown) => void;
  HELLO: (hello: { interval: number }) => void;
}

export declare interface Emitter {
  on<T extends keyof EmitterEvents>(event: T, listener: EmitterEvents[T]): this;
  emit<T extends keyof EmitterEvents>(
    event: T,
    ...args: Parameters<EmitterEvents[T]>
  ): boolean;
}

export class Emitter extends EventEmitter {}
