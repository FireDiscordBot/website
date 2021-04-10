import { useEffect } from "react"
import { useSession as useNextAuthSession } from "next-auth/client"

import { handler } from "@/pages/_app"

type Options = {
  redirectTo?: string
}

const useSession = ({ redirectTo }: Options = {}) => {
  const [session, loading] = useNextAuthSession()

  useEffect(() => {
    if (!redirectTo || loading) return

    if (redirectTo && !session) {
      handler?.router?.push(redirectTo)
    }
  }, [session, loading, redirectTo])

  return [session, loading] as const
}

export default useSession
