import { deflateSync, inflateSync } from "zlib"

import WebSocket from "isomorphic-ws"
import type { Session } from "next-auth"
import { UAParser } from "ua-parser-js"

import {
  AetherClientMessage,
  AetherClientOpcode,
  AetherClientPayloads,
  AetherGateway,
  AetherServerMessage,
  AetherServerOpcode,
} from "./types"

function uncompress(data: string): AetherServerMessage | null {
  const inflated = inflateSync(Buffer.from(data, "base64"), {
    level: 5,
  })?.toString()
  return !inflated ? null : (JSON.parse(inflated) as AetherServerMessage)
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
  ws: WebSocket | null = null
  private heartbeatInterval: NodeJS.Timeout | null = null
  private heartbeatAcked: boolean | null = null
  private currentSequence: number | null = null
  private currentRoute: string | null = null
  private aetherSessionId: string | null = null
  identified = false
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private userConfig: Record<string, any> | null = null

  constructor(gateway: AetherGateway, authSession: Session | null) {
    this.gateway = gateway
    this.authSession = authSession
  }

  connect() {
    if (this.ws && this.ws.readyState == WebSocket.OPEN) {
      this.debug("ws connection already open... closing")
      this.ws.close()
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
        this.startSendingHeartbeats(msg.d.interval)
        this.identify()
        break
      case AetherServerOpcode.RESUME_CLIENT:
        this.debug("received RESUME_CLIENT", msg.d)

        this.identified = true
        break
      case AetherServerOpcode.IDENTIFY_CLIENT:
        this.debug("received IDENTIFY_CLIENT", msg.d)

        this.identified = true
        this.userConfig = msg.d.config
        break
      case AetherServerOpcode.HEARTBEAT_ACK:
        this.debug("received HEARTBEAT_ACK")
        this.heartbeatAcked = true
        break
      case AetherServerOpcode.SESSIONS_REPLACE:
        // I don't think we need to store this data
        break
      case AetherServerOpcode.PUSH_ROUTE:
        // TODO: handle push route
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
  }

  setAuthSession(authSession: Session | null) {
    this.authSession = authSession
    if (!this.identified) {
      this.identify()
    } else {
      // TODO: reconnect
      this.connect()
    }
  }

  isSuperuser() {
    return this.userConfig && this.userConfig["utils.superuser"]
  }

  private identify() {
    if (this.ws?.readyState !== WebSocket.OPEN) {
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

  private startSendingHeartbeats(interval: number) {
    if (this.heartbeatInterval !== null) {
      clearInterval(this.heartbeatInterval)
    }

    this.heartbeatInterval = setInterval(() => {
      if (this.heartbeatAcked === false) {
        this.heartbeatAcked = null
        this.ws?.close(4004, "Did not receive heartbeat ack")
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
    if (this.ws?.readyState != WebSocket.OPEN || (msg.op != AetherClientOpcode.IDENTIFY_CLIENT && !this.identified)) {
      this.debug("Adding message to queue", msg)
      // TODO: add to queue
    } else {
      this.debug("Sending message", msg)
      this.ws.send(compress(msg))
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private debug(...args: any) {
    if (process.env.NODE_ENV === "development") {
      console.debug(...args)
    }
  }
}
