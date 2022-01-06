import { createStripePortalSession } from "@/lib/aether"
import { PostBillingPortalResponse } from "@/types"
import { withAuth, AuthenticatedApiHandler } from "@/lib/api/auth"
import { methodNotAllowed, respondWithError, respondWithSuccess } from "@/lib/api/response"

const handler: AuthenticatedApiHandler<PostBillingPortalResponse> = async (req, res, session) => {
  if (req.method !== "POST") {
    respondWithError(res, methodNotAllowed())
    return
  }

  const url = await createStripePortalSession(session.accessToken)

  respondWithSuccess(res, { url })
}

export default withAuth(handler)
