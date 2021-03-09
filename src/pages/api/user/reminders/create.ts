import { StatusCodes } from "http-status-codes"
import moment from "moment"

import { createUserReminder } from "@/lib/aether"
import { AuthenticatedApiHandler } from "@/types"
import { error, withSession } from "@/utils/api-handler-utils"
import { NetworkError } from "@/utils/fetcher"

const handler: AuthenticatedApiHandler = async (session, req, res) => {
  if (req.method !== "POST") {
    error(res, StatusCodes.METHOD_NOT_ALLOWED)
    return
  }
  let body: { reminder: string; timestamp: number }
  try {
    body = JSON.parse(req.body)
  } catch {
    error(res, StatusCodes.BAD_REQUEST)
    return
  }

  const minutes = moment(body.timestamp).diff(moment(), "minutes")
  if (!minutes || minutes < 2) {
    error(res, StatusCodes.PRECONDITION_FAILED, "Time is too short!")
    return
  }

  const largestTime = new Date()
  largestTime.setMinutes(largestTime.getMinutes() + minutes)
  if (moment(largestTime).diff(moment(), "months") >= 7) {
    error(res, StatusCodes.PRECONDITION_FAILED, "Reminders cannot currently be set for over 6 months in the future")
    return
  }

  const reminder = await createUserReminder(session.accessToken, req.body).catch((e) => e)
  if (reminder instanceof NetworkError)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return res.status(reminder.code).json(reminder.data as any)
  res.json(body)
  return
}

export default withSession(handler)
