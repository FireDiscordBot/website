import { getSession } from "next-auth/client"

import { Message } from "./message"
import { MessageUtil } from "./message-util"

import { WebsiteEvents } from "@/interfaces/aether"
import { AuthSession } from "@/interfaces/auth"
import { fire } from "@/constants"

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
export class EventHandler {
  identified: "identifying" | boolean
  heartbeat?: NodeJS.Timeout
  websocket?: WebSocket
  session?: AuthSession
  subscribed: string
  queue: Message[]

  constructor(session: AuthSession | null) {
    if (session) this.session = session
    this.identified = false
    this.subscribed = "/"
    this.queue = []
  }

  setWebsocket(websocket: WebSocket) {
    this.websocket = websocket
    this.websocket.onopen = () => {
      console.info(
        `%c WS %c Websocket connected to ${this.websocket?.url}`,
        "background: #9CFC97; color: black; border-radius: 3px 0 0 3px;",
        "background: #353A47; color: white; border-radius: 0 3px 3px 0",
      )
      this.identify()
      while (this.queue?.length) this.send(this.queue.pop())
    }
    this.websocket.onclose = (event) => {
      console.error(
        `%c WS %c Websocket closed with code ${event.code}${
          event.reason ? " and reason " + event.reason : ""
        }. Attempting to reconnect in 2.5s.`,
        "background: #C95D63; color: white; border-radius: 3px 0 0 3px;",
        "background: #353A47; color: white; border-radius: 0 3px 3px 0",
      )
      this.identified = false
      try {
        sleep(2500).then(() => {
          console.info(
            "%c WS %c Reconnecting...",
            "background: #9CFC97; color: black; border-radius: 3px 0 0 3px;",
            "background: #353A47; color: white; border-radius: 0 3px 3px 0",
          )
          const ws = new WebSocket(fire.websiteSocketUrl)
          return this.setWebsocket(ws)
        })
      } catch {
        console.error(
          "%c WS %c Websocket failed to reconnect!",
          "background: #C95D63; color: white; border-radius: 3px 0 0 3px;",
          "background: #353A47; color: white; border-radius: 0 3px 3px 0",
        )
      }
    }
    return this
  }

  handleSubscribe(route: string) {
    if (route == this.subscribed) return
    this.send(new Message(WebsiteEvents.SUBSCRIBE, { route }))
    this.subscribed = route
  }

  setHeartbeat(interval: number) {
    if (this.heartbeat) clearInterval(this.heartbeat)
    this.heartbeat = setInterval(() => {
      this.send(new Message(WebsiteEvents.HEARTBEAT, {}))
    }, interval)
  }

  identify() {
    this.identified = "identifying"
    this.send(
      new Message(WebsiteEvents.IDENTIFY_CLIENT, {
        config: { subscribed: this.subscribed, session: this.session },
        env: process.env.NODE_ENV,
      }),
    )
    this.identified = true
  }

  private send(message?: Message) {
    if (!message || !this.websocket || this.websocket.readyState != this.websocket.OPEN)
      return message && this.queue.push(message)
    if (process.env.NODE_ENV == "development") (globalThis as { [key: string]: unknown }).eventHandler = this
    console.debug(
      `%c WS | Outgoing %c ${WebsiteEvents[message.type]}`,
      "background: #279AF1; color: white; border-radius: 3px 0 0 3px;",
      "background: #353A47; color: white; border-radius: 0 3px 3px 0",
      message.data,
    )
    if (this.identified == false && this.session) this.identify()
    else if (this.identified == false) {
      this.queue.push(message)
      getSession().then((session) => {
        if (session) {
          this.session = session
          this.identify()
        }
      })
      return
    }
    this.websocket.send(MessageUtil.encode(message))
  }
}
