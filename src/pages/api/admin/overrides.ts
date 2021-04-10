import { StatusCodes } from "http-status-codes"

import { getBuildOverrides } from "@/lib/aether"
import { AuthenticatedApiHandler } from "@/types"
import { error, withSession } from "@/utils/api-handler-utils"
import { BuildOverride } from "@/interfaces/aether"

const handler: AuthenticatedApiHandler<BuildOverride[]> = async (session, req, res) => {
  if (req.method !== "GET") {
    error(res, StatusCodes.METHOD_NOT_ALLOWED)
    return
  }

  const data = await getBuildOverrides(session.accessToken)
  res.json(data)
}

export default withSession(handler)
