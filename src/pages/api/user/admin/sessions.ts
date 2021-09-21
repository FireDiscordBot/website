import { StatusCodes } from "http-status-codes"

import { getSessions } from "@/lib/aether"
import { AnyObject, AuthenticatedApiHandler } from "@/types"
import { error, withSession } from "@/utils/api-handler-utils"
import { NetworkError } from "@/utils/fetcher"
import { AdminSessionData } from "@/interfaces/aether"

const handler: AuthenticatedApiHandler<AdminSessionData[] | AnyObject> = async (session, req, res) => {
  if (req.method !== "GET") {
    error(res, StatusCodes.METHOD_NOT_ALLOWED)
    return
  }

  try {
    const data = await getSessions(session.accessToken)
    res.json(data)
  } catch (err) {
    if (err instanceof NetworkError && typeof err.data != "undefined") {
      typeof err.data == "object" ? res.status(err.code).json(err.data) : res.status(err.code).send(err.data)
    } else throw err
  }
}

export default withSession(handler)
