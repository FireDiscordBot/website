import { BuildOverride } from "@/interfaces/aether"
import { getBuildOverrides } from "@/lib/aether/api"
import { AuthenticatedApiHandler, withAuth } from "@/lib/api/auth"
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
