import { EventEmitter } from "events"

import * as React from "react"

import { MessageUtil } from "@/lib/ws/message-util"
import { WebsiteEvents } from "@/interfaces/aether"

const useWebsocket = (url: string, emitter: EventEmitter) => {
  const [ws, setWebSocket] = React.useState<WebSocket | null>(null)
  React.useEffect(() => {
    const ws = new WebSocket(url)
    ws.onmessage = (message) => {
      const decoded = MessageUtil.decode(message.data)
      if (!decoded) return
      console.debug(
        `%c WS %c ${WebsiteEvents[decoded.type]}`,
        "background: #279AF1; color: white; border-radius: 3px 0 0 3px;",
        "background: #2F2F2F; color: white; border-radius: 0 3px 3px 0",
        decoded.data,
      )
      emitter.emit(WebsiteEvents[decoded.type], decoded.data)
    }
    setWebSocket(ws)

    return () => ws.close()
  }, [emitter, url])

  return [ws]
}

export default useWebsocket
