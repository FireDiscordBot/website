import { AuthSession } from "@/interfaces/auth"
import { NextApiHandler } from "next"
import { getSession } from "next-auth/client"
import { fetchCustomerId } from "@/utils/aether"
import { fetchSubscriptions } from "@/api/server-stripe"
import { NextApiRequest, NextApiResponse } from "next/dist/next-server/lib/utils"

/* eslint-disable @typescript-eslint/no-non-null-assertion */

type NextApiHandlerWithSession<T = unknown> = (
  session: AuthSession,
  req: NextApiRequest,
  res: NextApiResponse<T>,
) => void | Promise<void>

const list: NextApiHandlerWithSession = async (session, _req, res) => {
  const customerId = await fetchCustomerId(session.accessToken!)
  // TODO: remove test customer id
  // const customerId = "cus_Iwzg7RDIPSOPVd"
  const subscriptionsList = await fetchSubscriptions(customerId)

  const subscriptions = subscriptionsList.data.map((subscription) => ({
    id: subscription.id,
    name: subscription.items.data[0].plan.nickname,
  }))

  res.json(subscriptions)
}

const handler: NextApiHandler = async (req, res) => {
  const session = await getSession({ req })
  if (!session?.accessToken) {
    res.status(401)
    return
  }

  if (req.method == "GET") {
    await list(session, req, res)
  }
}

export default handler
