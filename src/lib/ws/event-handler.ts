import EventEmitter from "events"

import { getSession } from "next-auth/client"

import { Message } from "./message"
import { MessageUtil } from "./message-util"
import { Websocket } from "./websocket"

import { IdentifyResponse, EventType, ResumeResponse } from "@/interfaces/aether"
import { AuthSession } from "@/interfaces/auth"
import { fire } from "@/constants"
import { fetchUser } from "@/utils/discord"
import { APIMember, DiscordGuild } from "@/interfaces/discord"

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const getReconnectTime = (code: number) => {
  switch (code) {
    case 1012: {
      return process.env.NODE_ENV == "development" ? 10000 : 2500
    }
    case 4005: {
      return 0
    }
    default: {
      return 2500
    }
  }
}

export class EventHandler {
  identified: "identifying" | boolean
  config?: Record<string, unknown>
  heartbeat?: NodeJS.Timeout
  private _session?: string
  logIgnore: EventType[]
  guilds: DiscordGuild[]
  initialised?: boolean
  websocket?: Websocket
  emitter: EventEmitter
  private _seq?: number
  auth?: AuthSession
  subscribed: string
  queue: Message[]
  acked?: boolean

  constructor(session: AuthSession | null, emitter: EventEmitter) {
    if (session) this.auth = session
    this.subscribed = typeof window != "undefined" ? window.location.pathname : "/"
    this.identified = false
    this.emitter = emitter
    this.guilds = []
    this.queue = []
    this._seq = 0

    this.logIgnore = [EventType.HEARTBEAT, EventType.HEARTBEAT_ACK]
  }

  get seq() {
    return this._seq || 0
  }

  set seq(seq: number) {
    this._seq = seq
    if (typeof window != "undefined") window.sessionStorage.setItem("aether_seq", seq.toString())
  }

  get session() {
    return this._session || ""
  }

  set session(session: string) {
    this._session = session
    if (typeof window != "undefined") window.sessionStorage.setItem("aether_session", session)
  }

  setWebsocket(websocket: Websocket, reconnect?: boolean) {
    websocket.eventHandler = this
    if (this.websocket) {
      this.websocket.close(1000, "Reconnecting")
      delete this.websocket
    }
    this.websocket = websocket
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
    this.websocket.onclose = (event: CloseEvent) => {
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
      else if (event.code == 4005) {
        if (this.identified == true && !!this.session)
          this.emitter.emit("NOTIFICATION", {
            text: "Invalid Session",
            severity: "error",
            horizontal: "right",
            vertical: "top",
            autoHideDuration: 5000,
          })
        delete this._session
        delete this._seq
        if (typeof window != "undefined") {
          window.sessionStorage.removeItem("aether_session")
          window.sessionStorage.removeItem("aether_seq")
        }
      } else
        this.emitter.emit("NOTIFICATION", {
          text: event.reason ? event.reason : "Websocket error occurred",
          severity: "error",
          horizontal: "right",
          vertical: "top",
          autoHideDuration: 5000,
        })
      this.identified = false
      if (event.code == 4001) {
        console.warn(
          `%c Session %c Checking session... `,
          "background: #FFFD98; color: black; border-radius: 3px 0 0 3px;",
          "background: #353A47; color: white; border-radius: 0 3px 3px 0",
        )
        // Failed to verify identify, check session
        getSession()
          .then(async (session) => {
            if (session && session.accessToken) {
              const user = await fetchUser(session.accessToken).catch()
              if (!user && typeof window !== "undefined") {
                console.warn(
                  `%c Session %c Session is invalid, attempting to logout `,
                  "background: #FFFD98; color: black; border-radius: 3px 0 0 3px;",
                  "background: #353A47; color: white; border-radius: 0 3px 3px 0",
                )
                window.document.getElementById("user-menu-logout")?.click()
              } else if (typeof window !== "undefined") {
                console.info(
                  `%c WS %c Session is valid, attempting refresh! `,
                  "background: #9CFC97; color: black; border-radius: 3px 0 0 3px;",
                  "background: #353A47; color: white; border-radius: 0 3px 3px 0",
                  user,
                )
                window.sessionStorage.removeItem("aether_session")
                window.sessionStorage.removeItem("aether_seq")
                window.location.reload()
              }
            }
          })
          .catch(() => {
            console.warn(
              `%c Session %c Session is invalid or failed to fetch, attempting to logout `,
              "background: #FFFD98; color: black; border-radius: 3px 0 0 3px;",
              "background: #353A47; color: white; border-radius: 0 3px 3px 0",
            )
            window.document.getElementById("user-menu-logout")?.click()
          })
      }
      // cannot recover from codes below (4001 is special and handled above but if we're here, it didn't work)
      if (
        event.code == 1013 ||
        event.code == 1008 ||
        event.code == 4001 ||
        event.code == 4003 ||
        event.code == 4015 ||
        event.code == 4016
      )
        return
      try {
        sleep(getReconnectTime(event.code)).then(() => {
          console.info(
            "%c WS %c Reconnecting... ",
            "background: #9CFC97; color: black; border-radius: 3px 0 0 3px;",
            "background: #353A47; color: white; border-radius: 0 3px 3px 0",
          )
          const ws = new Websocket(`${fire.websiteSocketUrl}?sessionId=${this.session}&seq=${this.seq}&encoding=zlib`)
          return this.setWebsocket(ws, this.identified == true && !!this.session)
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
    this.send(new Message(EventType.SUBSCRIBE, { route, extra }))
    this.subscribed = route
  }

  HELLO(data: { sessionId: string; interval: number }) {
    if (this.heartbeat) clearInterval(this.heartbeat)
    this.heartbeat = setInterval(() => {
      if (this.acked == false) {
        delete this.acked // resets to undefined
        return this.websocket?.close(4004, "Did not receive heartbeat ack")
      }
      this.acked = false
      this.send(new Message(EventType.HEARTBEAT, this.seq || null))
    }, data.interval)
    this.session = data.sessionId
  }

  RESUME_CLIENT(data: ResumeResponse) {
    if (this.auth?.user?.id != data.user?.id) {
      delete this._session
      delete this._seq
      if (typeof window != "undefined") {
        window.sessionStorage.removeItem("aether_session")
        window.sessionStorage.removeItem("aether_seq")
      }
      return this.websocket?.close(4005, "Invalid Session")
    } else if (this.auth && data.user) this.auth.user = data.user
    if (!data.guilds.length || data.guilds.length != this.guilds.length) {
      this.send(new Message(EventType.GUILD_SYNC, { existing: this.guilds }))
      this.guilds = []
    }
    this.identified = true // should already be true but just in case
    this.session = data.session
    this.config = { ...this.config, ...data.config }
    if (process.env.NODE_ENV == "development" || (this.config && this.config["utils.superuser"] == true))
      (globalThis as { [key: string]: unknown }).eventHandler = this // easy access for debugging
    console.info(
      `%c WS %c Successfully resumed${data.replayed ? " with " + data.replayed + " replayed events" : ""} `,
      "background: #9CFC97; color: black; border-radius: 3px 0 0 3px;",
      "background: #353A47; color: white; border-radius: 0 3px 3px 0",
    )
  }

  HEARTBEAT_ACK() {
    this.acked = true
  }

  async identify() {
    if (this.identified) return
    this.identified = "identifying"
    const identified = await this.sendIdentify().catch((reason: string) => {
      this.websocket?.close(4008, reason)
    })
    if (!identified) return
    this.config = { ...this.config, ...identified.config }
    if (process.env.NODE_ENV == "development" || (this.config && this.config["utils.superuser"] == true))
      // easy access for debugging
      (globalThis as { [key: string]: unknown }).eventHandler = this
    else delete (globalThis as { [key: string]: unknown }).eventHandler
    if (this.auth?.user?.id != identified.user?.id) this.websocket?.close(4001, "Failed to verify identify")
    if (this.auth?.user?.id) this.send(new Message(EventType.GUILD_SYNC, {}))
    this.identified = true
    setTimeout(() => {
      if (!this.heartbeat && this.websocket && this.websocket.readyState == this.websocket.OPEN)
        this.websocket.close(4004, "Did not receive HELLO")
    }, 2000)
  }

  private sendIdentify(): Promise<IdentifyResponse | null> {
    return new Promise((resolve, reject) => {
      const nonce = (+new Date()).toString()
      this.websocket?.handlers.set(nonce, resolve)
      this.send(
        new Message(
          EventType.IDENTIFY_CLIENT,
          {
            config: { subscribed: this.subscribed ?? window.location.pathname, session: this.auth },
            env: process.env.NODE_ENV,
          },
          nonce,
        ),
      )

      setTimeout(() => {
        if (this.websocket?.handlers.has(nonce) && this.identified != true) {
          this.websocket.handlers.delete(nonce)
          reject("Identify timed out")
        } else if (this.websocket?.handlers.has(nonce)) {
          this.websocket.handlers.delete(nonce)
          resolve(null)
        }
      }, 10000)
    })
  }

  sendGuildJoinRequest(id: string, nonce: string) {
    this.send(new Message(EventType.GUILD_JOIN_REQUEST, { id }, nonce))
  }

  requestData(nonce: string) {
    this.send(new Message(EventType.DATA_REQUEST, {}, nonce))
  }

  CONFIG_UPDATE(data: { name: string; value: unknown }) {
    if (!this.config) return
    if (data.value == "deleteSetting") return delete this.config[data.name]
    this.config[data.name] = data.value
  }

  GUILD_CREATE(guild: DiscordGuild & { bot?: APIMember }) {
    if (!this.guilds.find((g) => g.id == guild.id)) this.guilds.push(guild)
  }

  GUILD_DELETE(data: { id: string }) {
    this.guilds = this.guilds.filter((guild) => guild.id != data.id)
  }

  GUILD_SYNC(
    data:
      | { success: false; code: number } // error occured
      | { success: true; guilds: { id: string; unavailable: true }[] } // success
      | { success: null }, // finished guild sync
  ) {
    if (data.success == false) {
      console.error(
        `%c GUILDS %c Guild Sync Failed! `,
        "background: #C95D63; color: white; border-radius: 3px 0 0 3px;",
        "background: #353A47; color: white; border-radius: 0 3px 3px 0",
        data,
      )
      // we're about to be given a GUILD_CREATE for all mutual guilds, which can be spammy
    } else if (data.success == true) this.logIgnore.push(EventType.GUILD_CREATE)
    // mass guild sync has finished, we can unignore.
    else this.logIgnore = this.logIgnore.filter((type) => type != EventType.GUILD_CREATE)
  }

  devToolsWarning() {
    if (this.initialised) return
    console.log(
      `%c STOP!

%cUNLESS YOU KNOW WHAT YOU'RE DOING, DO NOT COPY/PASTE ANYTHING IN HERE!
DOING SO COULD REVEAL SENSITIVE INFORMATION SUCH AS YOUR EMAIL OR ACCESS TOKEN

IT'S BEST TO JUST CLOSE THIS WINDOW AND PRETEND IT DOES NOT EXIST.`,
      "background: #C95D63; color: white; font-size: xxx-large; border-radius: 8px 8px 8px 8px;",
      "background: #353A47; color: white; font-size: medium; border-radius: 0 0 0 0",
    )
  }

  private send(message?: Message) {
    if (!message || !this.websocket || this.websocket.readyState != this.websocket.OPEN)
      return message && this.queue.push(message)
    if (process.env.NODE_ENV == "development" || (this.config && this.config["utils.superuser"] == true))
      // easy access for debugging
      (globalThis as { [key: string]: unknown }).eventHandler = this
    else delete (globalThis as { [key: string]: unknown }).eventHandler
    // heartbeats can be spammy and just have the sequence anyways
    if (!this.logIgnore.includes(message.type))
      console.debug(
        `%c WS %c Outgoing %c ${EventType[message.type]} `,
        "background: #279AF1; color: white; border-radius: 3px 0 0 3px;",
        "background: #9CFC97; color: black; border-radius: 0 3px 3px 0",
        "background: #353A47; color: white; border-radius: 0 3px 3px 0",
        message.toJSON(),
      )
    if (this.identified == false && this.auth) this.identify()
    else if (this.identified == false) {
      this.queue.push(message)
      getSession().then((session) => {
        if (session) {
          this.auth = session
          this.identify()
        }
      })
      return
    }
    this.websocket.send(MessageUtil.encode(message))
  }
}
