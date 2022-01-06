import { fetchPlans } from "@/lib/plans"
import { GetSubscriptionsResponse } from "@/types"
import { withAuth, AuthenticatedApiHandler } from "@/lib/api/auth"
import { respondWithSuccess } from "@/lib/api/response"

const handler: AuthenticatedApiHandler<GetSubscriptionsResponse> = async (_req, res) => {
  const plans = await fetchPlans()
  respondWithSuccess(res, plans)
}

export default withAuth(handler)
