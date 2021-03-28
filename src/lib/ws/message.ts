import { WebsiteEvents } from "../../interfaces/aether"

export class Message {
  type: WebsiteEvents
  nonce?: string
  data: unknown

  constructor(type: WebsiteEvents, data: unknown, nonce?: string) {
    this.nonce = nonce
    this.type = type
    this.data = data
  }

  toJSON() {
    return {
      op: this.type,
      d: this.data,
      n: this.nonce,
    }
  }
}
