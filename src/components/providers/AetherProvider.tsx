import type { AlertColor } from "@mui/material/Alert"
import type { Handler } from "mitt"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState, createContext, ReactNode } from "react"

import useAppSnackbar from "@/hooks/use-snackbar-control"
import { AetherClient } from "@/lib/aether/AetherClient"
import { fetchWebsiteGateway } from "@/lib/aether/api"
import type { AetherGateway } from "@/lib/aether/types"

export const AetherClientContext = createContext<AetherClient | null>(null)

interface AetherProviderProps {
  children: ReactNode
}

export function AetherProvider(props: AetherProviderProps) {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
  const { showSnackbar } = useAppSnackbar()
  const [gateway, setGateway] = useState<AetherGateway | null>(null)
  const [client, setClient] = useState<AetherClient | null>(null)

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

    if (client && client.connected) {
      // Handles access token updates
      client.setAuthSession(session)
    } else {
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

  useEffect(() => {
    if (!client) {
      return
    }

    const handleNotification: Handler<[string, AlertColor]> = ([message, severity]) => {
      showSnackbar(message, 5000, severity)
    }

    client.events.on("notification", handleNotification)

    return () => {
      client && client.events.off("notification", handleNotification)
    }
  }, [showSnackbar, client])

  return <AetherClientContext.Provider value={client}>{props.children}</AetherClientContext.Provider>
}
