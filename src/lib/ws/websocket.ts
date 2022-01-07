import { AetherClient } from "./aether-client"
import { MessageUtil } from "./message-util"

import { EventType } from "@/interfaces/aether"

let WebSocket
if (typeof window != "undefined") WebSocket = window.WebSocket
else {
  WebSocket = require("ws") // for typings since otherwise it screams about shit being missing
}

export class Websocket extends WebSocket {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handlers: Map<string, (value: any) => void>
  aether?: AetherClient
  connectedTo: string

  constructor(url: string, eventHandler?: AetherClient) {
    super(url)
    this.connectedTo = url.split("?")[0]
    this.handlers = new Map()
    this.onmessage = (event: MessageEvent) => {
      const message = MessageUtil.decode(event.data)
      if (!message)
        return console.error(
          "%c WS %c Messages %c Failed to decode message! ",
          "background: #279AF1; color: white; border-radius: 3px 0 0 3px;",
          "background: #C95D63; color: white; border-radius: 0 3px 3px 0",
          "background: #353A47; color: white; border-radius: 0 3px 3px 0",
          { data: event.data },
        )
      if (this.aether) {
        if (typeof message.s == "number") this.aether.seq = message.s
        // heartbeats acks can be spammy and have a null body anyways
        if (!this.aether.logIgnore.includes(message.op))
          console.debug(
            `%c WS %c Incoming %c ${EventType[message.op]} `,
            "background: #279AF1; color: white; border-radius: 3px 0 0 3px;",
            "background: #9CFC97; color: black; border-radius: 0 3px 3px 0",
            "background: #353A47; color: white; border-radius: 0 3px 3px 0",
            message,
          )
        this.aether.emitter.emit(EventType[message.op], message.d)
        // @ts-expect-error This is needed to ensure this[string] works
        if (EventType[message.op] in this.aether) this.aether[EventType[message.op]](message.d)
      }
      if (message.n && this.handlers.has(message.n)) {
        const handler = this.handlers.get(message.n)
        if (handler) handler(message.d)
        this.handlers.delete(message.n)
      }
    }
    if (eventHandler) {
      this.aether = eventHandler
      this.aether.setWebsocket(this)
    }
  }

  get open() {
    return this.readyState === this.OPEN
  }
}
