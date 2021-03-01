import { EventEmitter } from "events"

import * as React from "react"
import { getSession } from "next-auth/client"

import { EventHandler } from "@/lib/ws/event-handler"

const useWebsocket = (url: string, emitter: EventEmitter) => {
  const [handler, setHandler] = React.useState<EventHandler | null>(null)
  React.useEffect(() => {
    const ws = new WebSocket(url)
    const initHandler = async () => {
      const session = await getSession()
      const handler = new EventHandler(session, emitter).setWebsocket(ws)
      setHandler(handler)
    }
    initHandler()

    return () => ws.close()
  }, [emitter, url])

  return [handler]
}

export default useWebsocket
