import { createStripePortalSession } from "@/lib/aether/api"
import { AuthenticatedApiHandler, withAuth } from "@/lib/api/auth"
import { methodNotAllowed, respondWithError, respondWithSuccess } from "@/lib/api/response"
import { PostBillingPortalResponse } from "@/types"

const handler: AuthenticatedApiHandler<PostBillingPortalResponse> = async (req, res, session) => {
  if (req.method !== "POST") {
    respondWithError(res, methodNotAllowed())
    return
  }

  const url = await createStripePortalSession(session.accessToken)

  respondWithSuccess(res, { url })
}

export default withAuth(handler)
