import { StatusCodes } from "http-status-codes"
import { Stripe } from "stripe"

import { createErrorResponse } from "@/utils/fetcher"
import stripe from "@/api/server-stripe"
import { createStripeCheckoutSession, fetchCustomerId } from "@/lib/aether"
import { AuthenticatedApiHandler, GetSubscriptionResponse, PostSubscriptionResponse } from "@/types"
import { error, withSession } from "@/utils/api-handler-utils"

const subscriptionComparator = (first: Stripe.Subscription, second: Stripe.Subscription) => {
  const getStatusWeight = (status: Stripe.Subscription.Status) => {
    switch (status) {
      case "active":
        return 1
      case "trialing":
        return 2
      default:
        return 3
    }
  }
  return getStatusWeight(first.status) - getStatusWeight(second.status)
}

const get: AuthenticatedApiHandler<GetSubscriptionResponse> = async (session, _req, res) => {
  let customerId: string

  try {
    customerId = await fetchCustomerId(session.accessToken)
  } catch (e) {
    const errorResponse = createErrorResponse(e)
    if (errorResponse.error.includes("Customer Not Found")) {
      res.json({
        hasSubscription: false,
      })
    } else {
      error(res, errorResponse.code, errorResponse.error)
    }
    return
  }

  const response = await stripe.subscriptions.list({
    customer: customerId,
    expand: ["data.plan.product"],
  })

  const subscriptions = response.data.sort(subscriptionComparator)
  const hasSubscription = subscriptions.some((subscription) => ["trialing", "active"].includes(subscription.status))

  if (!hasSubscription) {
    res.json({
      hasSubscription: false,
    })
    return
  }

  const subscription = subscriptions[0]
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const product: Stripe.Product = subscription.plan.product

  res.json({
    hasSubscription: true,
    subscription: {
      id: subscription.id,
      name: product.name,
      status: subscription.status,
      servers: parseInt(product.metadata.servers ?? "0", 10),
      start: subscription.start_date * 1000,
      periodStart: subscription.current_period_start * 1000,
      periodEnd: subscription.current_period_end * 1000,
      trialEnd: subscription.trial_end ? subscription.trial_end * 1000 : null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  })
}

const post: AuthenticatedApiHandler<PostSubscriptionResponse> = async (session, req, res) => {
  if (typeof req.query.servers != "string") {
    error(res, StatusCodes.BAD_REQUEST)
    return
  }

  const servers = parseInt(req.query.servers)

  if (![1, 3, 5].includes(servers)) {
    error(res, StatusCodes.BAD_REQUEST)
    return
  }

  const stripeSessionId = await createStripeCheckoutSession(session.accessToken, servers)

  res.json({ sessionId: stripeSessionId })
}

const handler: AuthenticatedApiHandler<GetSubscriptionResponse | PostSubscriptionResponse> = (session, req, res) => {
  switch (req.method) {
    case "GET":
      return get(session, req, res)
    case "POST":
      return post(session, req, res)
    default:
      error(res, StatusCodes.METHOD_NOT_ALLOWED)
      break
  }
}

export default withSession(handler)
