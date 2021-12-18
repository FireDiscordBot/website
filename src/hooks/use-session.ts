import { handler } from "@/pages/_app"
import Router from "next/router"
import { useEffect } from "react"

type Options = {
  redirectTo?: string
}

const useSession = ({ redirectTo }: Options = {}) => {
  useEffect(() => {
    if (!redirectTo || typeof handler?.auth == "undefined") return

    if (redirectTo && !handler.auth) {
      Router.push(redirectTo)
    }
  }, [redirectTo])

  return [handler?.auth, typeof handler?.auth == "undefined"] as const
}

export default useSession
