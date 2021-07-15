import { EventEmitter } from "events"

import * as React from "react"
import { getSession } from "next-auth/client"

import { EventHandler } from "@/lib/ws/event-handler"
import { Websocket } from "@/lib/ws/websocket"
import { WebsiteGateway } from "@/interfaces/aether"

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const useWebsocket = (emitter: EventEmitter) => {
  const [handler, setHandler] = React.useState<EventHandler>()
  React.useEffect(() => {
    let ws: Websocket
    const initHandler = async () => {
      const session = await getSession()
      const handler = new EventHandler(session, emitter)
      const gateway = await handler.api.gateway.website.get<WebsiteGateway>({ version: 2 })
      if (!gateway.limits.connect.remaining) {
        console.error(
          `%c WS %c Rate Limit %c Hit WS connect limit, waiting for ${
            gateway.limits.connect.resetAfter / 1000
          } seconds... `,
          "background: #279AF1; color: white; border-radius: 3px 0 0 3px;",
          "background: #C95D63; color: white; border-radius: 3px 0 0 3px;",
          "background: #353A47; color: white; border-radius: 0 3px 3px 0",
        )
        await sleep(gateway.limits.connect.resetAfter)
      } else if (!gateway.limits.connectGlobal.remaining) {
        console.error(
          `%c WS %c Rate Limit %c Hit global WS connect limit, waiting for ${
            gateway.limits.connectGlobal.resetAfter / 1000
          } seconds... `,
          "background: #279AF1; color: white; border-radius: 3px 0 0 3px;",
          "background: #C95D63; color: white; border-radius: 3px 0 0 3px;",
          "background: #353A47; color: white; border-radius: 0 3px 3px 0",
        )
        // this may be a long time (as the limit is currently per-day) so we send a notification
        handler.emitter.emit("NOTIFICATION", {
          text: "You are being rate limited!",
          severity: "error",
          horizontal: "right",
          vertical: "top",
          autoHideDuration: gateway.limits.connectGlobal.resetAfter,
        })
        await sleep(gateway.limits.connectGlobal.resetAfter)
      }
      ws = new Websocket(
        typeof window == "undefined"
          ? gateway.url
          : `${gateway.url}?sessionId=${window.sessionStorage.getItem("aether_session") || ""}&seq=${
              window.sessionStorage.getItem("aether_seq") || "0"
            }&encoding=zlib`,
        handler,
      )
      handler.setWebsocket(ws)
      if (typeof window != "undefined" && window.sessionStorage.getItem("aether_session")?.length == 32)
        handler.session = window.sessionStorage.getItem("aether_session") as string
      setHandler(handler)
    }
    initHandler().catch(() => {
      console.error()
    })

    return () => ws?.close()
  }, [emitter])

  return handler
}

export default useWebsocket
