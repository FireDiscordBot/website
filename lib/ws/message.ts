import { WebsiteEvents } from "../interfaces/aether"

export class Message {
  type: WebsiteEvents
  data: unknown

  constructor(type: WebsiteEvents, data: unknown) {
    this.type = type
    this.data = data
  }

  toJSON() {
    return {
      op: this.type,
      d: this.data,
    }
  }
}