import { EventType } from "../../interfaces/aether"

export class Message {
  type: EventType
  nonce?: string
  data: unknown

  constructor(type: EventType, data: unknown, nonce?: string) {
    this.nonce = nonce
    this.type = type
    this.data = data
  }

  toJSON() {
    if (this.nonce)
      return {
        op: this.type,
        d: this.data,
        n: this.nonce,
      }
    else return { op: this.type, d: this.data }
  }
}
