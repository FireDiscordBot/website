import EventEmitter from "events"

import { getSession } from "next-auth/client"

import { Message } from "./message"
import { MessageUtil } from "./message-util"

import { DiscoverableGuild, WebsiteEvents } from "@/interfaces/aether"
import { AuthSession } from "@/interfaces/auth"
import { fire } from "@/constants"

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export class EventHandler {
  identified: "identifying" | boolean
  heartbeat?: NodeJS.Timeout
  websocket?: WebSocket
  session?: AuthSession
  emitter: EventEmitter
  subscribed: string
  queue: Message[]

  constructor(session: AuthSession | null, emitter: EventEmitter) {
    if (session) this.session = session
    this.identified = false
    this.emitter = emitter
    this.subscribed = typeof window != "undefined" ? window.location.pathname : "/"
    this.queue = []
  }

  setWebsocket(websocket: WebSocket, reconnect?: boolean) {
    if (this.websocket) {
      this.websocket.close(1000, "Reconnecting")
      delete this.websocket
    }
    this.websocket = websocket
    this.websocket.onmessage = (message) => {
      const decoded = MessageUtil.decode(message.data)
      if (!decoded)
        return console.error(
          "%c WS %c Failed to decode message! ",
          "background: #C95D63; color: white; border-radius: 3px 0 0 3px;",
          "background: #353A47; color: white; border-radius: 0 3px 3px 0",
          { data: message.data },
        )
      console.debug(
        `%c WS %c Incoming %c ${WebsiteEvents[decoded.type]} `,
        "background: #279AF1; color: white; border-radius: 3px 0 0 3px;",
        "background: #9CFC97; color: black; border-radius: 0 3px 3px 0",
        "background: #353A47; color: white; border-radius: 0 3px 3px 0",
        decoded,
      )
      this.emitter.emit(WebsiteEvents[decoded.type], decoded.data)
      // @ts-expect-error This is needed to ensure this[string] works
      if (WebsiteEvents[decoded.type] in this) this[WebsiteEvents[decoded.type]](decoded.data)
    }
    this.websocket.onopen = () => {
      reconnect &&
        this.emitter.emit("NOTIFICATION", {
          text: "Websocket connected",
          severity: "success",
          horizontal: "right",
          vertical: "top",
          autoHideDuration: 3000,
        })
      console.info(
        `%c WS %c Websocket connected! `,
        "background: #9CFC97; color: black; border-radius: 3px 0 0 3px;",
        "background: #353A47; color: white; border-radius: 0 3px 3px 0",
        this.websocket,
      )
      this.identify()
      while (this.queue?.length) this.send(this.queue.pop())
    }
    this.websocket.onclose = (event) => {
      console.error(
        `%c WS %c Websocket closed! `,
        "background: #C95D63; color: white; border-radius: 3px 0 0 3px;",
        "background: #353A47; color: white; border-radius: 0 3px 3px 0",
        event,
      )
      if (event.code == 4015)
        this.emitter.emit("NOTIFICATION", {
          text: "Connected to websocket in another session",
          severity: "error",
          horizontal: "right",
          vertical: "top",
          autoHideDuration: 15000,
        })
      else if (event.code == 4016)
        this.emitter.emit("NOTIFICATION", {
          text: "Connected to websocket from another location",
          severity: "error",
          horizontal: "right",
          vertical: "top",
          autoHideDuration: 15000,
        })
      else
        this.emitter.emit("NOTIFICATION", {
          text: "Websocket error occurred",
          severity: "error",
          horizontal: "right",
          vertical: "top",
          autoHideDuration: 5000,
        })
      this.identified = false
      // cannot recover from codes below
      if (event.code == 1013 || event.code == 1008 || event.code == 4001 || event.code == 4015 || event.code == 4016)
        return
      try {
        sleep(2500).then(() => {
          console.info(
            "%c WS %c Reconnecting... ",
            "background: #9CFC97; color: black; border-radius: 3px 0 0 3px;",
            "background: #353A47; color: white; border-radius: 0 3px 3px 0",
          )
          const ws = new WebSocket(fire.websiteSocketUrl)
          return this.setWebsocket(ws, true)
        })
      } catch {
        console.error(
          "%c WS %c Websocket failed to reconnect! ",
          "background: #C95D63; color: white; border-radius: 3px 0 0 3px;",
          "background: #353A47; color: white; border-radius: 0 3px 3px 0",
        )
      }
    }
    if (this.websocket.readyState == this.websocket.CLOSED)
      this.websocket.onclose(new CloseEvent("unknown", { code: 0, reason: "unknown", wasClean: false }))
    return this
  }

  handleSubscribe(route: string, extra?: unknown) {
    if (route == this.subscribed && !extra) return
    this.send(new Message(WebsiteEvents.SUBSCRIBE, { route, extra }))
    this.subscribed = route
  }

  HELLO(data: { interval: number }) {
    if (this.heartbeat) clearInterval(this.heartbeat)
    this.heartbeat = setInterval(() => {
      this.send(new Message(WebsiteEvents.HEARTBEAT, {}))
    }, data.interval)
  }

  identify() {
    if (this.identified) return
    this.identified = "identifying"
    if (this.heartbeat) {
      clearInterval(this.heartbeat)
      delete this.heartbeat
    }
    this.send(
      new Message(WebsiteEvents.IDENTIFY_CLIENT, {
        config: { subscribed: this.subscribed ?? window.location.pathname, session: this.session },
        env: process.env.NODE_ENV,
      }),
    )
    this.identified = true
    setTimeout(() => {
      if (!this.heartbeat && this.websocket && this.websocket.readyState == this.websocket.OPEN)
        this.websocket.close(4004, "Did not receive HELLO")
    }, 2000)
  }

  DISCOVERY_UPDATE(data: DiscoverableGuild[]) {
    this.handleSubscribe(
      "/discover",
      data.map((guild) => guild.id),
    )
  }

  private send(message?: Message) {
    if (!message || !this.websocket || this.websocket.readyState != this.websocket.OPEN)
      return message && this.queue.push(message)
    if (process.env.NODE_ENV == "development") (globalThis as { [key: string]: unknown }).eventHandler = this
    // heartbeats can be spammy and have empty objects anyways
    if (message.type != WebsiteEvents.HEARTBEAT)
      console.debug(
        `%c WS %c Outgoing %c ${WebsiteEvents[message.type]} `,
        "background: #279AF1; color: white; border-radius: 3px 0 0 3px;",
        "background: #9CFC97; color: black; border-radius: 0 3px 3px 0",
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
