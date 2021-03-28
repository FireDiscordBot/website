import { EventHandler } from "./event-handler"
import { MessageUtil } from "./message-util"

import { WebsiteEvents } from "@/interfaces/aether"

let WebSocket
if (typeof window != "undefined") WebSocket = window.WebSocket
else {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  WebSocket = require("ws") // for typings since otherwise it screams about shit being missing
}

export class Websocket extends WebSocket {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handlers: Map<string, (value: any) => void>
  eventHandler?: EventHandler

  constructor(url: string, eventHandler?: EventHandler) {
    super(url)
    if (eventHandler) this.eventHandler = eventHandler
    this.handlers = new Map()
    this.onmessage = (event: MessageEvent) => {
      const message = MessageUtil.decode(event.data)
      if (!message)
        return console.error(
          "%c WS %c Failed to decode message! ",
          "background: #C95D63; color: white; border-radius: 3px 0 0 3px;",
          "background: #353A47; color: white; border-radius: 0 3px 3px 0",
          { data: event.data },
        )
      if (this.eventHandler) {
        if (typeof message.s == "number") this.eventHandler.seq = message.s
        if (typeof window != "undefined" && this.eventHandler.session) {
          window.localStorage.setItem("aether_session", this.eventHandler.session)
          window.localStorage.setItem("aether_seq", this.eventHandler.seq?.toString() || "0")
        }
        // heartbeats acks can be spammy and have a null body anyways
        if (message.op != WebsiteEvents.HEARTBEAT_ACK)
          console.debug(
            `%c WS %c Incoming %c ${WebsiteEvents[message.op]} `,
            "background: #279AF1; color: white; border-radius: 3px 0 0 3px;",
            "background: #9CFC97; color: black; border-radius: 0 3px 3px 0",
            "background: #353A47; color: white; border-radius: 0 3px 3px 0",
            message,
          )
        this.eventHandler.emitter.emit(WebsiteEvents[message.op], message.d)
        // @ts-expect-error This is needed to ensure this[string] works
        if (WebsiteEvents[message.op] in this.eventHandler) this.eventHandler[WebsiteEvents[message.op]](message.d)
      }
      if (message.n && this.handlers.has(message.n)) {
        const handler = this.handlers.get(message.n)
        if (handler) handler(message.d)
        this.handlers.delete(message.n)
      }
    }
  }
}
