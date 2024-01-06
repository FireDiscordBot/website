import { StatusCodes } from "http-status-codes"

import { deleteUserReminder } from "@/lib/aether"
import { AuthenticatedApiHandler } from "@/types"
import { error, withSession } from "@/utils/api-handler-utils"
import { NetworkError } from "@/utils/fetcher"

const snowflakeRegex = /\d{15,21}/

const handler: AuthenticatedApiHandler = async (session, req, res) => {
  if (!req.query.timestamp || parseInt(req.query.timestamp as string) < +new Date()) {
    error(
      res,
      StatusCodes.BAD_REQUEST,
      parseInt(req.query.timestamp as string) < +new Date() ? "Invalid Timestamp" : undefined,
    )
    return
  }
  if (!req.query.id || !snowflakeRegex.test(req.query.id as string)) {
    error(res, StatusCodes.BAD_REQUEST, !snowflakeRegex.test(req.query.id as string) ? "Invalid ID" : undefined)
    return
  }

  const deleted = await deleteUserReminder(
    session.accessToken,
    req.query.timestamp as string,
    req.query.id as string,
  ).catch((e) => e)
  if (deleted instanceof NetworkError) return res.status(deleted.code).json(deleted.data as any)
  res.status(200).json({})
  return
}

export default withSession(handler)
