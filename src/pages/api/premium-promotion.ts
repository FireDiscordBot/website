import { getOngoingPromotion } from "@/lib/aether"
import { AuthenticatedApiHandler, PromotionMessage } from "@/types"
import { error, withSession } from "@/utils/api-handler-utils"
import { StatusCodes } from "http-status-codes"

const handler: AuthenticatedApiHandler<PromotionMessage> = async (session, req, res) => {
  if (req.method !== "GET") {
    error(res, StatusCodes.METHOD_NOT_ALLOWED)
    return
  }

  const data = await getOngoingPromotion(session.accessToken)
  res.json(data)
}

export default withSession(handler)
