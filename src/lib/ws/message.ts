import { WebsiteEvents } from "../../interfaces/aether"

export class Message {
  type: WebsiteEvents
  data: Record<string, unknown>

  constructor(type: WebsiteEvents, data: Record<string, unknown>) {
    this.type = type
    this.data = data
  }

  toJSON() {
    return {
      t: this.type,
      d: this.data,
    }
  }
}
