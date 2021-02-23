import { fetchPlans } from "@/lib/plans"
import { AuthenticatedApiHandler, GetSubscriptionsResponse } from "@/types"
import { withSession } from "@/utils/api-handler-utils"

const handler: AuthenticatedApiHandler<GetSubscriptionsResponse> = async (_session, _req, res) => {
  const plans = await fetchPlans()
  res.json(plans)
}

export default withSession(handler)
