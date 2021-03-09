import {StatusCodes} from "http-status-codes"

import {createUserReminder} from "@/lib/aether"
import {AuthenticatedApiHandler} from "@/types"
import {error, withSession} from "@/utils/api-handler-utils"

const handler: AuthenticatedApiHandler<{}> = async (session, req, res) => {
  if (req.method !== "POST") {
    error(res, StatusCodes.METHOD_NOT_ALLOWED)
    return
  }
  await createUserReminder(session.accessToken, req.body)
}

export default withSession(handler)
