import { AuthenticatedApiHandler, withAuth } from "@/lib/api/auth"
import { respondWithSuccess } from "@/lib/api/response"
import { fetchPlans } from "@/lib/plans"
import { GetSubscriptionsResponse } from "@/types"

const handler: AuthenticatedApiHandler<GetSubscriptionsResponse> = async (_req, res) => {
  const plans = await fetchPlans()
  respondWithSuccess(res, plans)
}

export default withAuth(handler)
