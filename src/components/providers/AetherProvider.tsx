import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect } from "react"
import { useState } from "react"
import { createContext, ReactNode } from "react"

import { AetherClient } from "@/lib/aether/AetherClient"
import { fetchWebsiteGateway } from "@/lib/aether/api"
import { AetherGateway } from "@/lib/aether/types"

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
  const router = useRouter()
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
    console.log("[AetherProvider] useEffect", sessionStatus, session?.accessToken, gateway)

    if (!gateway || sessionStatus === "loading") {
      return
    }

    if (client && client.connected) {
      console.log("[AetherProvider] updating auth session")
      // Handles access token updates
      client.setAuthSession(session)
    } else {
      console.log("[AetherProvider] starting connection")

      const handlePushRoute = (route: string) => {
        router.push(route)
      }

      // Initial connection
      const newClient = new AetherClient(gateway, session, router.pathname ?? location.pathname, handlePushRoute)
      newClient.connect()

      // Access to the client when developing locally
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(global as any).aetherClients = (global as any).aetherClients || []
        ;(global as any).aetherClients.push(newClient)
      }

      setClient((prevClient) => {
        // Little hack to prevent duplicated connections
        if (prevClient && prevClient.connected) {
          console.log("[AetherProvider] found duplicated connection, closing it")
          prevClient.disconnect()
        }

        return newClient
      })
    }

    return () => {
      client?.disconnect()
      setClient(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionStatus, session?.accessToken, gateway])

  useEffect(() => {
    function handler(url: string) {
      if (client && client.connected) {
        client.setCurrentRoute(url)
      }
    }

    router.events.on("routeChangeComplete", handler)

    return () => {
      router.events.off("routeChangeComplete", handler)
    }
  }, [router, client])

  return <AetherStateContext.Provider value={state}>{props.children}</AetherStateContext.Provider>
}
