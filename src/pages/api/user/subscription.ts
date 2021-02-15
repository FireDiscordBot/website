import { NextApiHandler, NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/client"
import { AuthSession } from "@/interfaces/auth"
import { createStripeSession, fetchCustomerId } from "@/lib/aether"
import stripe from "@/api/server-stripe"

/* eslint-disable @typescript-eslint/no-non-null-assertion */

type NextApiHandlerWithSession<T = unknown> = (
  session: AuthSession,
  req: NextApiRequest,
  res: NextApiResponse<T>,
) => void | Promise<void>

const get: NextApiHandlerWithSession = async (session, _req, res) => {
  const customerId = await fetchCustomerId(session.accessToken!)
  const subscriptionsList = await stripe.subscriptions.list({
    customer: customerId,
  })

  const subscriptions = subscriptionsList.data.map((subscription) => ({
    id: subscription.id,
    name: subscription.items.data[0].plan.nickname,
  }))

  res.json(subscriptions)
}

const post: NextApiHandlerWithSession = async (session, req, res) => {
  if (typeof req.query.servers != "string") {
    res.status(500)
    return
  }

  const servers = parseInt(req.query.servers)

  if (![1, 3, 5].includes(servers)) {
    res.status(500)
    return
  }

  const sessionId = await createStripeSession(session.accessToken!, servers)

  res.json({ sessionId })
}

const handler: NextApiHandler = async (req, res) => {
  const session = await getSession({ req })
  if (!session?.accessToken) {
    res.status(401)
    return
  }

  switch (req.method) {
    case "GET":
      get(session, req, res)
      break
    case "POST":
      post(session, req, res)
      break
    default:
      break
  }
}

export default handler
