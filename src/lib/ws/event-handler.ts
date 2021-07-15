import EventEmitter from "events"

import { getSession } from "next-auth/client"
import Router, { Router as RouterType } from "next/router"

import { Message } from "./message"
import { MessageUtil } from "./message-util"
import { Websocket } from "./websocket"

import { IdentifyResponse, EventType, ResumeResponse, WebsiteGateway, ExperimentConfig } from "@/interfaces/aether"
import { AuthSession } from "@/interfaces/auth"
import { fetchUser, getBannerImage, getAvatarImage } from "@/utils/discord"
import { APIMember, AuthorizationInfo, DiscordGuild } from "@/interfaces/discord"
import routeBuilder from "@/utils/api-router"

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const getReconnectTime = (code: number) => {
  switch (code) {
    case 1012: {
      return process.env.NODE_ENV == "development" ? 12000 : 3000
    }
    case 4005:
    case 4999: {
      return 0
    }
    default: {
      return 2500
    }
  }
}

export class EventHandler {
  configListeners: Record<string, (value: unknown) => void>
  identified: "identifying" | boolean
  config?: Record<string, unknown>
  experiments: ExperimentConfig[]
  heartbeat?: NodeJS.Timeout
  private _session?: string
  oauth?: AuthorizationInfo
  logIgnore: EventType[]
  guilds: DiscordGuild[]
  initialised?: boolean
  websocket?: Websocket
  emitter: EventEmitter
  private _seq?: number
  router?: RouterType
  auth?: AuthSession
  subscribed: string
  queue: Message[]
  acked?: boolean

  constructor(session: AuthSession | null, emitter: EventEmitter) {
    if (session) {
      this.auth = session
      this.auth.refresh = this.getSession.bind(this)
    } else this.getSession()
    this.subscribed = typeof window != "undefined" ? window.location.pathname : "/"
    this.configListeners = {}
    this.identified = false
    this.emitter = emitter
    this.experiments = []
    this.guilds = []
    this.queue = []
    this._seq = 0

    this.logIgnore = [EventType.HEARTBEAT, EventType.HEARTBEAT_ACK]
    this.router = Router.router ?? undefined
    if (this.router) this.router.events.on("routeChangeStart", this.handleSubscribe.bind(this))
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

  get user() {
    return this.oauth?.user
  }

  async getSession(): Promise<AuthSession> {
    const session = await getSession().catch(() => null)
    if (session) {
      this.auth = session
      this.auth.refresh = this.getSession.bind(this)
    }
    return this.auth as AuthSession
  }

  get api() {
    return routeBuilder(this)
  }

  setWebsocket(websocket: Websocket) {
    if (process.env.NODE_ENV == "development" || (this.config && this.config["utils.superuser"] == true))
      // easy access for debugging
      (globalThis as { [key: string]: unknown }).eventHandler = this
    delete this.acked
    websocket.eventHandler = this
    if (this.websocket) {
      this.websocket.close(1000, "Reconnecting")
      delete this.websocket
    }
    this.websocket = websocket
    this.websocket.onopen = () => {
      console.info(
        `%c WS %c Connection %c Websocket connected! `,
        "background: #279AF1; color: white; border-radius: 3px 0 0 3px;",
        "background: #9CFC97; color: black; border-radius: 0 3px 3px 0",
        "background: #353A47; color: white; border-radius: 0 3px 3px 0",
        { url: websocket.url },
      )
      while (this.queue.length) this.send(this.queue.pop())
    }
    this.websocket.onclose = async (event: CloseEvent) => {
      console.error(
        `%c WS %c Connection %c Websocket closed! `,
        "background: #279AF1; color: white; border-radius: 3px 0 0 3px;",
        "background: #C95D63; color: white; border-radius: 0 3px 3px 0",
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
      } else if (event.code != 4001)
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
                  `%c WS %c Sessions %c Session is valid! `,
                  "background: #279AF1; color: white; border-radius: 3px 0 0 3px;",
                  "background: #9CFC97; color: black; border-radius: 0 3px 3px 0",
                  "background: #353A47; color: white; border-radius: 0 3px 3px 0",
                  user,
                )
                window.sessionStorage.removeItem("aether_session")
                window.sessionStorage.removeItem("aether_seq")
                delete this._session
                delete this._seq
                if (!this.websocket) throw new Error("what the fuck")
                const ws = new Websocket(`${this.websocket.url}?encoding=zlib`)
                return this.setWebsocket(ws)
              }
            } else {
              delete this.auth
              window.sessionStorage.removeItem("aether_session")
              window.sessionStorage.removeItem("aether_seq")
              delete this._session
              delete this._seq
              if (!this.websocket) throw new Error("what the fuck")
              const ws = new Websocket(`${this.websocket.url}?encoding=zlib`)
              return this.setWebsocket(ws)
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
      if (event.code == 4029) {
        const gateway = await this.api.gateway.website.get<WebsiteGateway>({ version: 2 })
        if (!gateway.limits.connect.remaining) {
          console.error(
            `%c WS %c Rate Limit %c Waiting for ${gateway.limits.connect.resetAfter / 1000} seconds... `,
            "background: #279AF1; color: white; border-radius: 3px 0 0 3px;",
            "background: #C95D63; color: white; border-radius: 3px 0 0 3px;",
            "background: #353A47; color: white; border-radius: 0 3px 3px 0",
          )
          await sleep(gateway.limits.connect.resetAfter)
        } else if (!gateway.limits.connectGlobal.remaining) {
          console.error(
            `%c WS %c Rate Limit %c Waiting for ${gateway.limits.connectGlobal.resetAfter / 1000} seconds... `,
            "background: #279AF1; color: white; border-radius: 3px 0 0 3px;",
            "background: #C95D63; color: white; border-radius: 3px 0 0 3px;",
            "background: #353A47; color: white; border-radius: 0 3px 3px 0",
          )
          await sleep(gateway.limits.connectGlobal.resetAfter)
        }
      }
      try {
        await sleep(getReconnectTime(event.code))
        console.info(
          "%c WS %c Connection %c Reconnecting... ",
          "background: #279AF1; color: white; border-radius: 3px 0 0 3px;",
          "background: #9CFC97; color: black; border-radius: 0 3px 3px 0",
          "background: #353A47; color: white; border-radius: 0 3px 3px 0",
        )
        if (!this.websocket) throw new Error("what the fuck")
        const ws = new Websocket(`${this.websocket.url}?sessionId=${this.session}&seq=${this.seq}&encoding=zlib`)
        return this.setWebsocket(ws)
      } catch {
        console.error(
          "%c WS %c Connection %c Websocket failed to reconnect! ",
          "background: #279AF1; color: white; border-radius: 3px 0 0 3px;",
          "background: #C95D63; color: white; border-radius: 3px 0 0 3px;",
          "background: #353A47; color: white; border-radius: 0 3px 3px 0",
        )
      }
    }
    if (this.websocket.readyState == this.websocket.CLOSED)
      this.websocket.onclose(new CloseEvent("unknown", { code: 0, reason: "unknown", wasClean: false }))
    return this
  }

  registerConfigListener(key: string, listener: (value: unknown) => void) {
    this.configListeners[key] = listener
  }

  handleSubscribe(route: string, extra?: unknown) {
    this.configListeners = {} // these are set inside pages so if we're changing page, we clear it
    if (route == this.subscribed && (!extra || extra == { shallow: false })) return
    this.send(new Message(EventType.SUBSCRIBE, { route, extra }))
    this.subscribed = route
  }

  HELLO(data: {
    guildExperiments: ExperimentConfig[]
    userExperiments: ExperimentConfig[]
    sessionId: string
    interval: number
  }) {
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
    this.experiments = [...data.guildExperiments, ...data.userExperiments]
    this.identify()
  }

  async RESUME_CLIENT(data: ResumeResponse) {
    if (this.auth?.user?.id != data.auth?.user?.id) {
      delete this._session
      delete this._seq
      if (typeof window != "undefined") {
        window.sessionStorage.removeItem("aether_session")
        window.sessionStorage.removeItem("aether_seq")
      }
      return this.websocket?.close(4005, "Invalid Session")
    } else if (this.auth && data.auth) this.oauth = data.auth
    if (this.auth?.user?.id && (!data.guilds.length || data.guilds.length != this.guilds.length)) {
      this.send(new Message(EventType.GUILD_SYNC, { existing: this.guilds }))
      this.guilds = []
    }
    this.identified = true // should already be true but just in case
    if (typeof this.auth?.refresh == "function") await this.auth.refresh()
    if (this.auth?.user?.image && data.auth?.user?.avatar && !this.auth?.user?.image.includes(data.auth?.user?.avatar))
      this.auth.user.image = getAvatarImage(data.auth.user, process.env.USE_MOD_SIX == "true")
    if (this.auth && data.auth?.user?.banner && !this.auth?.user?.banner?.includes(data.auth?.user?.banner))
      this.auth.user.banner = getBannerImage(data.auth.user)
    while (this.queue.length) this.send(this.queue.pop())
    this.session = data.session
    this.config = { ...this.config, ...data.config }
    for (const [key, value] of Object.entries(this.config))
      if (key in this.configListeners) this.configListeners[key](value)
    this.oauth = data.auth
    if (process.env.NODE_ENV == "development" || (this.config && this.config["utils.superuser"] == true))
      (globalThis as { [key: string]: unknown }).eventHandler = this // easy access for debugging
    console.info(
      `%c WS %c Sessions %c Successfully resumed${data.replayed ? " with " + data.replayed + " replayed events" : ""} `,
      "background: #279AF1; color: white; border-radius: 3px 0 0 3px;",
      "background: #9CFC97; color: black; border-radius: 0 3px 3px 0",
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
    for (const [key, value] of Object.entries(this.config))
      if (key in this.configListeners) this.configListeners[key](value)
    this.oauth = identified.auth
    if (process.env.NODE_ENV == "development" || (this.config && this.config["utils.superuser"] == true))
      // easy access for debugging
      (globalThis as { [key: string]: unknown }).eventHandler = this
    else delete (globalThis as { [key: string]: unknown }).eventHandler
    if (this.auth && this.auth?.user?.id != identified.auth?.user?.id)
      this.websocket?.close(4001, "Mismatched identities")
    this.identified = true
    if (this.auth?.user?.id) this.send(new Message(EventType.GUILD_SYNC, {}))
    if (typeof this.auth?.refresh == "function") await this.auth.refresh()
    if (
      this.auth?.user?.image &&
      identified.auth?.user?.avatar &&
      !this.auth?.user?.image.includes(identified.auth?.user?.avatar)
    )
      this.auth.user.image = getAvatarImage(identified.auth.user, process.env.USE_MOD_SIX == "true")
    if (this.auth && identified.auth?.user?.banner && !this.auth?.user?.banner?.includes(identified.auth?.user?.banner))
      this.auth.user.banner = getBannerImage(identified.auth.user)
    while (this.queue.length) this.send(this.queue.pop())
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
            config: {
              subscribed: this.subscribed ?? window.location.pathname,
              session: {
                accessToken: this.auth?.accessToken,
                refreshToken: this.auth?.refreshToken,
                expires: this.auth?.expires,
                user: this.auth?.user,
              },
            },
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

  applyExperiment(label: string, id: string, bucket: number) {
    this.send(
      new Message(EventType.APPLY_EXPERIMENT, {
        label,
        id,
        bucket,
      }),
    )
  }

  CONFIG_UPDATE(data: { name: string; value: unknown }) {
    if (!this.config) return
    if (data.value == "deleteSetting") return delete this.config[data.name]
    this.config[data.name] = data.value
    if (data.name in this.configListeners) this.configListeners[data.name](data.value)
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
    } else if (data.success) this.logIgnore.push(...[EventType.GUILD_CREATE, EventType.GUILD_DELETE])
    else
      this.logIgnore = this.logIgnore.filter(
        (event) => event != EventType.GUILD_CREATE && event != EventType.GUILD_DELETE,
      )
  }

  PUSH_ROUTE(data: { route: string }) {
    this.navigate(data.route)
  }

  navigate(route: string, extra?: unknown) {
    if (this.router?.route == route) return
    this.router?.push(route).then((pushed) => {
      if (pushed) this.handleSubscribe(route, extra)
    })
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
    if (
      !message ||
      !this.websocket ||
      this.websocket.readyState != this.websocket.OPEN ||
      (message.type != EventType.IDENTIFY_CLIENT && !this.identified)
    )
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
    this.websocket.send(MessageUtil.encode(message))
  }
}
