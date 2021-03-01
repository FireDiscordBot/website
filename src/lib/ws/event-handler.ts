import { Message } from "./message"
import { MessageUtil } from "./message-util"

import { WebsiteEvents } from "@/interfaces/aether"

export class EventHandler {
  websocket?: WebSocket
  subscribed: string
  queue: string[]

  constructor() {
    this.subscribed = "/"
    this.queue = []
  }

  setWebsocket(websocket: WebSocket) {
    this.websocket = websocket
    this.websocket.onopen = () => {
      this.identify()
      while (this.queue?.length) this.send(this.queue.pop())
    }
    return this
  }

  handleSubscribe(route: string) {
    if (route == this.subscribed) return
    console.debug(
      `%c WS %c SUBSCRIBE`,
      "background: #279AF1; color: white; border-radius: 3px 0 0 3px;",
      "background: #2F2F2F; color: white; border-radius: 0 3px 3px 0",
      { from: this.subscribed, to: route },
    )
    this.send(MessageUtil.encode(new Message(WebsiteEvents.SUBSCRIBE, { route })))
    this.subscribed = route
  }

  identify() {
    this.send(MessageUtil.encode(new Message(WebsiteEvents.IDENTIFY_CLIENT, { config: { subscribed: "/" } })))
  }

  private send(message?: string) {
    if (!message || !this.websocket || this.websocket.readyState != this.websocket.OPEN)
      return message && this.queue.push(message)
    this.websocket.send(message)
  }
}