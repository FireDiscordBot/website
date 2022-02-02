import { deflateSync, inflateSync } from "zlib"

import WebSocket from "isomorphic-ws"
import type { Session } from "next-auth"
import { UAParser } from "ua-parser-js"

import {
  AetherClientMessage,
  AetherClientOpcode,
  AetherClientPayloads,
  AetherCloseCode,
  AetherGateway,
  AetherServerMessage,
  AetherServerOpcode,
  ExperimentConfig,
} from "./types"

import { ClusterStats, Command } from "@/interfaces/aether"
import { DiscordGuild } from "@/interfaces/discord"

function uncompress(data: string): AetherServerMessage | null {
  const inflated = inflateSync(Buffer.from(data, "base64"), {
    level: 5,
  })?.toString()
  return !inflated ? null : JSON.parse(inflated)
}

function compress(msg: AetherClientMessage): string {
  return deflateSync(JSON.stringify(msg), { level: 5 }).toString("base64")
}

function buildClientInfo() {
  const info = <AetherClientPayloads[AetherClientOpcode.IDENTIFY_CLIENT]["config"]["client"]>{
    referrer: window.document?.referrer ?? "",
    platform: { name: "Unknown", version: "Unknown" },
    browser: { name: "Unknown", version: "Unknown" },
    device: { mobile: null, model: null },
    userAgent: navigator?.userAgent,
    language: navigator?.language,
  }

  if (navigator?.userAgent) {
    // Maybe remove this? Unnecessary package that justs add more size to the final bundle
    const userAgentData = new UAParser(navigator?.userAgent ?? "")
    info.browser = userAgentData.getBrowser()
    info.platform = userAgentData.getOS()

    const device = userAgentData.getDevice()
    info.device = {
      mobile:
        typeof device.type == "string"
          ? device.type == "mobile" || device.type == "tablet" || device.type == "wearable"
          : null,
      model: device.model,
    }

    const arch = userAgentData.getCPU().architecture
    if (arch) {
      info.platform.arch = arch
    }
  }

  return info
}

export class AetherClient {
  private gateway: AetherGateway
  private authSession: Session | null = null
  private ws: WebSocket | null = null
  private heartbeatInterval: NodeJS.Timeout | null = null
  private heartbeatAcked: boolean | null = null
  private currentSequence: number | null = null
  private currentRoute: string | null = null
  private aetherSessionId: string | null = null
  private identified = false
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private userConfig: Record<string, any> | null = null
  // @ts-expect-error It will be used in the future
  private experiments: ExperimentConfig[] = []
  private guilds: DiscordGuild[] = []
  private commands: Command[] = []
  clusterStats: ClusterStats[] = []

  private handlePushRoute?: (route: string) => void

  constructor(
    gateway: AetherGateway,
    authSession: Session | null,
    currentRoute: string | null,
    handlePushRoute?: (route: string) => void,
  ) {
    this.gateway = gateway
    this.authSession = authSession
    this.currentRoute = currentRoute
    this.handlePushRoute = handlePushRoute
  }

  connect() {
    if (this.connected) {
      this.debug("ws connection already open... closing")
      this.disconnect()
    }

    const params = new URLSearchParams()
    params.append("encoding", "zlib")

    if (this.aetherSessionId) {
      this.debug("Found existing aether session id, using it")
      params.append("session", this.aetherSessionId)
      params.append("seq", this.currentSequence?.toString() ?? "0")
    }

    const url = `${this.gateway.url}?${params.toString()}`
    this.debug("connecting to", url)
    this.ws = new WebSocket(url)
    this.ws.onmessage = this.handleWsMessage.bind(this)
    this.ws.onclose = this.handleWsClose.bind(this)
  }

  disconnect(code = 1000, reason?: string) {
    this.ws?.close(code, reason)
  }

  setAuthSession(authSession: Session | null) {
    if (this.authSession?.accessToken === authSession?.accessToken) {
      this.debug("auth session is the same, not updating")
      return
    }

    this.authSession = authSession
    if (!this.identified) {
      this.identify()
    } else {
      this.disconnect(AetherCloseCode.SESSION_TIMEOUT, "Reauthenticating")
      this.connect()
    }
  }

  setCurrentRoute(currentRoute: string) {
    if (this.currentRoute === currentRoute) {
      return
    }

    this.currentRoute = currentRoute
    this.sendMessage({
      op: AetherClientOpcode.SUBSCRIBE,
      d: {
        route: currentRoute,
      },
    })
  }

  isSuperuser() {
    return this.userConfig && this.userConfig["utils.superuser"]
  }

  get connected() {
    // The double exclamation mark casts the type to boolean
    return !!this.ws && this.ws.readyState === WebSocket.OPEN
  }

  private handleWsMessage(event: WebSocket.MessageEvent) {
    // It will always be a string
    const msg = uncompress(event.data as string)

    if (!msg) {
      this.debug("unable to decompress message", event.data)
      return
    }

    if (typeof msg.s === "number") {
      this.debug("received new sequence", msg)
      this.currentSequence = msg.s
    }

    switch (msg.op) {
      case AetherServerOpcode.HELLO:
        this.debug("received HELLO", msg.d)

        this.aetherSessionId = msg.d.sessionId
        this.experiments = [...msg.d.guildExperiments, ...msg.d.userExperiments]
        this.guilds = []

        this.commands = [...this.commands, ...msg.d.firstCategory] // Prevents clearing commands when reconnecting
        // Is this really necessary?
        this.commands = this.commands.filter(
          (c, index) => this.commands.findIndex((c2) => c2.name === c.name) === index,
        )

        this.startSendingHeartbeats(msg.d.interval)
        this.identify()
        break
      case AetherServerOpcode.RESUME_CLIENT:
        this.debug("received RESUME_CLIENT", msg.d)

        this.identified = true

        const newGuilds = msg.d.guilds
        if (this.authSession && (!newGuilds.length || newGuilds.length !== this.guilds.length)) {
          this.requestGuildsSync()
          this.guilds = []
        }

        break
      case AetherServerOpcode.IDENTIFY_CLIENT:
        this.debug("received IDENTIFY_CLIENT", msg.d)

        this.identified = true
        this.userConfig = msg.d.config

        if (this.authSession) {
          this.requestGuildsSync()
        }
        break
      case AetherServerOpcode.HEARTBEAT_ACK:
        this.debug("received HEARTBEAT_ACK")
        this.heartbeatAcked = true
        break
      case AetherServerOpcode.SESSIONS_REPLACE:
        // I don't think we need to store this data
        break
      case AetherServerOpcode.PUSH_ROUTE:
        this.debug("received PUSH_ROUTE", msg.d)
        // Maybe a better way to do this
        this.handlePushRoute?.(msg.d.route)
        break
      case AetherServerOpcode.GUILD_SYNC:
        if (msg.d.success === false) {
          this.debug("failed to sync guilds", msg.d.code)
        }
        break
      case AetherServerOpcode.GUILD_CREATE:
        const createdGuild = msg.d

        // Only adds the guild if it's not already in the list
        if (!this.guilds.find((g) => g.id == createdGuild.id)) {
          this.guilds.push(createdGuild)
        }
        break
      case AetherServerOpcode.GUILD_DELETE:
        const deletedGuild = msg.d
        // Removes the guild if it's in the list
        this.guilds = this.guilds.filter((guild) => guild.id !== deletedGuild.id)
        break
      case AetherServerOpcode.REALTIME_STATS:
        if (msg.d.id === -1) {
          this.debug("received initial stats", msg.d)
          return
        }

        const newClusterStat = msg.d as ClusterStats
        const index = this.clusterStats.findIndex((clusterStat) => clusterStat.id === newClusterStat.id)

        if (index !== -1) {
          this.clusterStats[index] = newClusterStat
        } else {
          this.clusterStats.push(newClusterStat)
        }

        break
      default:
        this.debug("Unknown opcode", msg)
        break
    }
  }

  private handleWsClose(event: WebSocket.CloseEvent) {
    this.debug("WebSocket closed", event)

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }
    this.heartbeatAcked = null
    this.identified = false

    switch (event.code) {
      case AetherCloseCode.CONNECTED_ANOTHER_SESSION:
        this.debug("already connected in another session")
        break
      case AetherCloseCode.CONNECTED_ANOTHER_LOCATION:
        this.debug("already connected from another location")
        break
      case AetherCloseCode.MISMATCHED_IDENTITY:
        this.debug("mismatched identity")

        this.aetherSessionId = null
        this.currentSequence = null

        // TODO: try to reload session
        break
      case AetherCloseCode.SHUTTING_DOWN:
        this.debug("Aether shutting down")

        this.aetherSessionId = null
        this.currentSequence = null
        break
      case AetherCloseCode.MISSING_REQUIRED_SCOPES:
        this.debug("missing required scopes")
        // TODO: redirects to login page
        break
      default:
        break
    }
  }

  private identify() {
    if (!this.connected) {
      this.debug("tried to identify with a closed connection")
      return
    }
    if (this.identified) {
      this.debug("tried to identify twice")
      return
    }

    this.debug("identifying")

    let session: AetherClientPayloads[AetherClientOpcode.IDENTIFY_CLIENT]["config"]["session"] = undefined

    if (this.authSession) {
      session = {
        accessToken: this.authSession.accessToken,
        refreshToken: this.authSession.refreshToken,
        expires: this.authSession.expires,
        user: {
          ...this.authSession.user,
          // Workaround for the current schema in Aether
          // TODO: ask Geek to change schema
          name: this.authSession.user.username,
          image: this.authSession.user.avatar,
        },
      }
    }

    this.sendMessage({
      op: AetherClientOpcode.IDENTIFY_CLIENT,
      d: {
        config: {
          subscribed: this.currentRoute ?? "/",
          session,
          client: buildClientInfo(),
        },
        env: process.env.NODE_ENV ?? "development",
      },
    })
  }

  private requestGuildsSync() {
    this.sendMessage({
      op: AetherClientOpcode.GUILD_SYNC,
      d: {
        existing: this.guilds ?? [],
      },
    })
  }

  private startSendingHeartbeats(interval: number) {
    if (this.heartbeatInterval !== null) {
      clearInterval(this.heartbeatInterval)
    }

    this.heartbeatInterval = setInterval(() => {
      if (this.heartbeatAcked === false) {
        this.heartbeatAcked = null
        this.ws?.close(AetherCloseCode.HEARTBEAT_EXPIRED, "Did not receive heartbeat ack")
        if (this.heartbeatInterval !== null) {
          clearInterval(this.heartbeatInterval)
        }
        return
      }

      this.debug("Sending heartbeat")
      this.heartbeatAcked = false
      this.sendMessage({
        op: AetherClientOpcode.HEARTBEAT,
        d: this.currentSequence ?? null,
      })
    }, interval)
  }

  private sendMessage(msg: AetherClientMessage) {
    if (!this.connected || (msg.op != AetherClientOpcode.IDENTIFY_CLIENT && !this.identified)) {
      this.debug("Adding message to queue", msg)
      // TODO: add to queue
    } else {
      this.debug("Sending message", msg)
      this.ws?.send(compress(msg))
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private debug(...args: any) {
    if (process.env.NODE_ENV === "development") {
      console.debug(...args)
    }
  }
}
