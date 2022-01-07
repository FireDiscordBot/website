import { AuthenticatedApiHandler, withAuth } from "@/lib/api/auth"
import { respondWithSuccess } from "@/lib/api/response"
import { fetchPlans } from "@/lib/stripe/premium"
import { GetPlansResponse } from "@/types"

const handler: AuthenticatedApiHandler<GetPlansResponse> = async (_req, res) => {
  const plans = await fetchPlans()
  respondWithSuccess(res, plans)
}

export default withAuth(handler)
