import { deflateSync, inflateSync } from "zlib"

import type { Session } from "next-auth"
import { UAParser } from "ua-parser-js"

import {
  AetherClientMessage,
  AetherClientOpcode,
  AetherClientPayloads,
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

// Little hack to bypass the need of the `ws` package on server side.
export function buildWebSocket() {
  class AetherWebSocket extends WebSocket {
    private authSession: Session
    private heartbeatInterval: NodeJS.Timeout | null = null
    private heartbeatAcked: boolean | null = null
    private identified = false
    private currentSequence: number | null = null
    private currentRoute: string | null = null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private userConfig: Record<string, any> | null = null

    constructor(url: string, authSession: Session) {
      super(url)
      this.authSession = authSession
    }

    onmessage = (event: MessageEvent) => {
      const msg = uncompress(event.data)
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
          this.debug("received HELLO")

          this.startSendingHeartbeats(msg.d.interval)
          this.identify()
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

    onclose = (event: CloseEvent) => {
      this.debug("WebSocket closed", event)
    }

    isSuperuser() {
      return this.userConfig && this.userConfig["utils.superuser"]
    }

    private identify() {
      this.debug("identifying")
      this.sendMessage({
        op: AetherClientOpcode.IDENTIFY_CLIENT,
        d: {
          config: {
            subscribed: this.currentRoute ?? "/",
            session: {
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
            },
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
          this.close(4004, "Did not receive heartbeat ack")
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
      if (this.readyState != this.OPEN || (msg.op != AetherClientOpcode.IDENTIFY_CLIENT && !this.identified)) {
        this.debug("Adding message to queue", msg)
        // TODO: add to queue
      } else {
        this.debug("Sending message", msg)
        this.send(compress(msg))
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private debug(...args: any) {
      if (process.env.NODE_ENV === "development") {
        console.debug(...args)
      }
    }
  }

  return AetherWebSocket
}
