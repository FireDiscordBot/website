import { useEffect } from "react"
import { useSession as useNextAuthSession } from "next-auth/client"
import Router from "next/router"

type Options = {
  redirectTo?: string
}

const useSession = ({ redirectTo }: Options = {}) => {
  const [session, loading] = useNextAuthSession()

  useEffect(() => {
    if (!redirectTo || loading) return

    if (redirectTo && !session) {
      Router.push(redirectTo)
    }
  }, [session, loading, redirectTo])

  return [session, loading] as const
}

export default useSession
