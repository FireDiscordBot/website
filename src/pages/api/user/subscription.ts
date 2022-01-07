import type { Stripe } from "stripe"

import { createStripeCheckoutSession, fetchCustomerId } from "@/lib/aether"
import { AuthenticatedApiHandler, withAuth } from "@/lib/api/auth"
import {
  badRequest,
  internalServerError,
  methodNotAllowed,
  respondWithError,
  respondWithSuccess,
} from "@/lib/api/response"
import stripe from "@/lib/stripe"
import { GetSubscriptionResponse, PostSubscriptionResponse } from "@/types"
import { createErrorResponse } from "@/utils/fetcher"

type SubscriptionWithPlan = Stripe.Subscription & { plan: Stripe.Plan }

const subscriptionComparator = (first: SubscriptionWithPlan, second: SubscriptionWithPlan) => {
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

const get: AuthenticatedApiHandler<GetSubscriptionResponse> = async (_req, res, session) => {
  let customerId: string

  try {
    customerId = await fetchCustomerId(session.accessToken)
  } catch (e: any) {
    const errorResponse = createErrorResponse(e)
    if (errorResponse.message.includes("Customer Not Found")) {
      respondWithSuccess(res, {
        hasSubscription: false,
      })
    } else {
      // TODO: handle errors
      respondWithError(res, internalServerError())
    }
    return
  }

  const response = await stripe.subscriptions.list({
    customer: customerId,
    expand: ["data.plan.product"],
  })

  const subscriptions = (response.data as SubscriptionWithPlan[]).sort(subscriptionComparator)
  const hasSubscription = subscriptions.some((subscription) =>
    ["trialing", "active", "past_due"].includes(subscription.status),
  )

  if (!hasSubscription) {
    respondWithSuccess(res, {
      hasSubscription: false,
    })
    return
  }

  const subscription = subscriptions[0]
  const product = subscription.plan.product

  if (!product || typeof product !== "object" || product.deleted) {
    // TODO: maybe handle this better
    respondWithSuccess(res, {
      hasSubscription: false,
    })
    return
  }

  let servers = parseInt(product.metadata.servers ?? "0", 10)
  if (subscription.metadata?.custom_limit)
    servers = parseInt(subscription.metadata?.custom_limit ?? servers.toString(), 10)

  respondWithSuccess(res, {
    hasSubscription: true,
    subscription: {
      id: subscription.id,
      name: product.name,
      status: subscription.status,
      servers,
      start: subscription.start_date * 1000,
      periodStart: subscription.current_period_start * 1000,
      periodEnd: subscription.current_period_end * 1000,
      trialEnd: subscription.trial_end ? subscription.trial_end * 1000 : null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  })
}

const post: AuthenticatedApiHandler<PostSubscriptionResponse> = async (req, res, session) => {
  if (typeof req.query.servers != "string") {
    respondWithError(res, badRequest())
    return
  }

  const servers = parseInt(req.query.servers)

  if (![1, 3, 5].includes(servers)) {
    respondWithError(res, badRequest())
    return
  }

  const stripeSessionId = await createStripeCheckoutSession(session.accessToken, servers)

  respondWithSuccess(res, { sessionId: stripeSessionId })
}

const handler: AuthenticatedApiHandler<GetSubscriptionResponse | PostSubscriptionResponse> = (req, res, session) => {
  switch (req.method) {
    case "GET":
      return get(req, res, session)
    case "POST":
      return post(req, res, session)
    default:
      respondWithError(res, methodNotAllowed())
      break
  }
}

export default withAuth(handler)
