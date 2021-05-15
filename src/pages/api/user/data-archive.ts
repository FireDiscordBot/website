import { StatusCodes } from "http-status-codes"

import { createDataArchive, getDataRequest } from "@/lib/aether"
import { AnyObject, AuthenticatedApiHandler, GetCollectData, PostCollectData } from "@/types"
import { error, withSession } from "@/utils/api-handler-utils"
import { NetworkError } from "@/utils/fetcher"

const handler: AuthenticatedApiHandler<PostCollectData | GetCollectData | AnyObject> = async (session, req, res) => {
  if (req.method !== "POST" && req.method !== "GET") {
    error(res, StatusCodes.METHOD_NOT_ALLOWED)
    return
  }

  try {
    if (req.method === "POST") {
      const url = await createDataArchive(session.accessToken)
      res.json({ url })
    } else if (req.method === "GET") {
      const data = await getDataRequest(session.accessToken)
      res.json(data)
    }
  } catch (err) {
    if (err instanceof NetworkError && typeof err.data != "undefined") {
      typeof err.data == "object" ? res.status(err.code).json(err.data) : res.status(err.code).send(err.data)
    } else throw err
  }
}

export default withSession(handler)
