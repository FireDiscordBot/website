import { useSession } from "next-auth/react"
import { useEffect } from "react"
import { useState } from "react"
import { createContext, ReactNode } from "react"

import { fetchWebsiteGateway } from "@/lib/aether/api"
import { AetherGateway } from "@/lib/aether/types"
import { AetherClient } from "@/lib/aether/ws"

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
  const { data: session, status: sessionStatus } = useSession()
  const [gateway, setGateway] = useState<AetherGateway | null>(null)
  const [client, setClient] = useState<AetherClient | null>(null)
  const [state] = useState<AetherConnectionState>({
    status: "disconnected",
  })

  useEffect(() => {
    let active = true

    async function load() {
      active && setGateway(await fetchWebsiteGateway())
    }
    load()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!gateway || sessionStatus === "loading") {
      return
    }

    if (client && client.ws && client.ws.readyState === client.ws.OPEN) {
      // Handles access token updates
      client.setAuthSession(session)
    } else {
      // Initial connection
      const newClient = new AetherClient(gateway, session)
      newClient.connect()

      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(global as any).aetherClient = newClient
      }

      setClient(newClient)
    }

    return () => {
      client?.ws?.close()
      setClient(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionStatus, session?.accessToken, gateway])

  return <AetherStateContext.Provider value={state}>{props.children}</AetherStateContext.Provider>
}
