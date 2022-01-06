import { StatusCodes } from "http-status-codes"

import { createStripePortalSession } from "@/lib/aether"
import { AuthenticatedApiHandler, PostBillingPortalResponse } from "@/types"
import { error, withSession } from "@/lib/api/api-handler-utils"

const handler: AuthenticatedApiHandler<PostBillingPortalResponse> = async (session, req, res) => {
  if (req.method !== "POST") {
    error(res, StatusCodes.METHOD_NOT_ALLOWED)
    return
  }

  const url = await createStripePortalSession(session.accessToken)

  res.json({ url })
}

export default withSession(handler)
