import { StatusCodes } from "http-status-codes"

import { createDataArchive, getDataRequest } from "@/lib/aether"
import { AuthenticatedApiHandler, GetCollectData, PostCollectData } from "@/types"
import { error, withSession } from "@/utils/api-handler-utils"

const handler: AuthenticatedApiHandler<PostCollectData | GetCollectData> = async (session, req, res) => {
  if (req.method !== "POST" && req.method !== "GET") {
    error(res, StatusCodes.METHOD_NOT_ALLOWED)
    return
  }

  if (req.method === "POST") {
    const url = await createDataArchive(session.accessToken)
    res.json({ url })
  } else if (req.method === "GET") {
    const data = await getDataRequest(session.accessToken)
    res.json(data)
  }
}

export default withSession(handler)
