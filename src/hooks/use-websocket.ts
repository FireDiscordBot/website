import { EventEmitter } from "events"

import * as React from "react"
import { getSession } from "next-auth/client"

import { MessageUtil } from "@/lib/ws/message-util"
import { WebsiteEvents } from "@/interfaces/aether"
import { EventHandler } from "@/lib/ws/event-handler"

const useWebsocket = (url: string, emitter: EventEmitter) => {
  const [handler, setHandler] = React.useState<EventHandler | null>(null)
  React.useEffect(() => {
    const ws = new WebSocket(url)
    ws.onmessage = (message) => {
      const decoded = MessageUtil.decode(message.data)
      if (!decoded) return
      console.debug(
        `%c WS %c Incoming %c ${WebsiteEvents[decoded.type]} `,
        "background: #279AF1; color: white; border-radius: 3px 0 0 3px;",
        "background: #9CFC97; color: black; border-radius: 0 3px 3px 0",
        "background: #353A47; color: white; border-radius: 0 3px 3px 0",
        decoded.data,
      )
      emitter.emit(WebsiteEvents[decoded.type], decoded.data)
    }
    const initHandler = async () => {
      const session = await getSession()
      const handler = new EventHandler(session).setWebsocket(ws)
      setHandler(handler)
    }
    initHandler()

    return () => ws.close()
  }, [emitter, url])

  return [handler]
}

export default useWebsocket
