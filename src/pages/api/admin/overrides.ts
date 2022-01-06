import { getBuildOverrides } from "@/lib/aether"
import { withAuth, AuthenticatedApiHandler } from "@/lib/api/auth"
import { BuildOverride } from "@/interfaces/aether"
import { methodNotAllowed, respondWithError, respondWithSuccess } from "@/lib/api/response"

const handler: AuthenticatedApiHandler<BuildOverride[]> = async (req, res, session) => {
  if (req.method !== "GET") {
    respondWithError(res, methodNotAllowed())
    return
  }

  const data = await getBuildOverrides(session.accessToken)
  respondWithSuccess(res, data)
}

export default withAuth(handler)
