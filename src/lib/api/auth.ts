import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next"
import type { Session } from "next-auth"
import { getSession } from "next-auth/react"
import { ApiResponse, respondWithError, unauthorized } from "./response"

export type AuthenticatedApiHandler<D> = (
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<D>>,
  session: Session & Required<Session>,
) => void | Promise<void>

export function withAuth<D>(handler: AuthenticatedApiHandler<D>): NextApiHandler {
  return async (req, res) => {
    const session = await getSession({ req })

    if (session?.accessToken && session?.refreshToken) {
      // Reconstruct the session object for asserting the types.
      await handler(req, res, { ...session, accessToken: session.accessToken, refreshToken: session.refreshToken })
    } else {
      respondWithError(res, unauthorized())
    }
  }
}
