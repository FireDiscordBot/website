import { fetchPlans } from "@/lib/plans"
import { AuthenticatedApiHandler, GetSubscriptionsResponse } from "@/types"
import { withSession } from "@/lib/api/api-handler-utils"

const handler: AuthenticatedApiHandler<GetSubscriptionsResponse> = async (_session, _req, res) => {
  const plans = await fetchPlans()
  res.json(plans)
}

export default withSession(handler)
