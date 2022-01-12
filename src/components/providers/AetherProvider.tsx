import { useSession } from "next-auth/react"
import { useEffect } from "react"
import { useState } from "react"
import { createContext, ReactNode } from "react"

import { fetchWebsiteGateway } from "@/lib/aether/api"
import { buildWebSocket } from "@/lib/aether/ws"

export interface AetherConnectionState {
  status: "connected" | "disconnected"
}

const AetherStateContext = createContext<AetherConnectionState>({
  status: "disconnected",
})

interface AetherProviderProps {
  children: ReactNode
}

export function AetherProvider(props: AetherProviderProps) {
  const { data: session } = useSession()
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [state] = useState<AetherConnectionState>({
    status: "disconnected",
  })

  useEffect(() => {
    const accessToken = session?.accessToken
    if (!accessToken) {
      return
    }
    if (ws?.readyState === WebSocket.OPEN) {
      return
    }

    const connect = async () => {
      const gateway = await fetchWebsiteGateway(accessToken)

      const AetherWebSocket = buildWebSocket()
      const ws = new AetherWebSocket(`${gateway.url}?encoding=zlib`, session)
      // TODO: handle reconnecting

      setWs(ws)
    }

    connect()

    return () => {
      ws?.close()
      setWs(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken])

  return <AetherStateContext.Provider value={state}>{props.children}</AetherStateContext.Provider>
}
