import { getReasonPhrase, StatusCodes } from "http-status-codes"
import { NextApiResponse } from "next"
import { getSession } from "next-auth/client"

import { ApiErrorResponse, ApiHandler, ApiResponseBody, AuthenticatedApiHandler } from "@/types"
import { AuthSession } from "@/interfaces/auth"

export const error = <T>(res: NextApiResponse<ApiResponseBody<T>>, code: StatusCodes, message?: string) => {
  if (message?.startsWith(`${code}: `)) message = message.slice(code.toString().length + 2)
  res.status(code).json(<ApiErrorResponse>{
    success: false,
    code,
    error: message ?? getReasonPhrase(code),
  })
}

export const withSession = <T>(handler: AuthenticatedApiHandler<T>): ApiHandler<T> => {
  return async (req, res) => {
    const session = (await getSession({ req })) as AuthSession
    if (!session?.accessToken) {
      error(res, StatusCodes.UNAUTHORIZED)
      return
    }

    const validSession = { ...session, accessToken: session.accessToken as string }

    await handler(validSession, req, res)
  }
}
