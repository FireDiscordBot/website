import { StatusCodes } from "http-status-codes"

import { createUserReminder } from "@/lib/aether"
import { AuthenticatedApiHandler } from "@/types"
import { error, withSession } from "@/utils/api-handler-utils"
import { NetworkError } from "@/utils/fetcher"

const handler: AuthenticatedApiHandler = async (session, req, res) => {
  if (req.method !== "POST") {
    error(res, StatusCodes.METHOD_NOT_ALLOWED)
    return
  } else if (!req.body.reminder || req.body.timestamp < +new Date()) {
    error(res, StatusCodes.BAD_REQUEST)
    return
  }

  const reminder = await createUserReminder(session.accessToken, req.body).catch((e) => e)
  if (reminder instanceof NetworkError)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return res.status(reminder.code).json(reminder.data as any)
  res.json(req.body)
  return
}

export default withSession(handler)
