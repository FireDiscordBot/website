import { useSession as useNextAuthSession } from "next-auth/react"
import Router from "next/router"
import { useEffect, useMemo } from "react"

interface Options {
  redirectTo?: string
}

const useSession = ({ redirectTo }: Options = {}) => {
  const { data, status } = useNextAuthSession()
  const loading = useMemo(() => status === "loading", [status])

  useEffect(() => {
    if (!redirectTo || loading) return

    if (redirectTo && !data) {
      Router.push(redirectTo)
    }
  }, [data, loading, redirectTo])

  return [data, loading] as const
}

export default useSession
