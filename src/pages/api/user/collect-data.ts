import { StatusCodes } from "http-status-codes"

import { createDataArchive } from "@/lib/aether"
import { AuthenticatedApiHandler, PostCollectData } from "@/types"
import { error, withSession } from "@/utils/api-handler-utils"

const handler: AuthenticatedApiHandler<PostCollectData> = async (session, req, res) => {
  if (req.method !== "POST") {
    error(res, StatusCodes.METHOD_NOT_ALLOWED)
    return
  }

  const url = await createDataArchive(session.accessToken)

  res.json({ url })
}

export default withSession(handler)
