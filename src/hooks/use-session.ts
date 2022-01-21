import { useEffect, useMemo } from "react"
import { signIn, useSession as useNextAuthSession } from "next-auth/react"
import Router from "next/router"

type Options = {
  redirectTo?: string
}

const useSession = ({ redirectTo }: Options = {}) => {
  const { data, status } = useNextAuthSession()
  const loading = useMemo(() => status === "loading", [status])

  useEffect(() => {
    if (!redirectTo || loading) return

    if (redirectTo && !data) {
      redirectTo == "login" ? signIn("discord") : Router.push(redirectTo)
    }
  }, [data, loading, redirectTo])

  return [data, loading] as const
}

export default useSession
