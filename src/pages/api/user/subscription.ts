import { StatusCodes } from "http-status-codes"
import { Stripe } from "stripe"

import { createErrorResponse } from "@/utils/fetcher"
import stripe from "@/api/server-stripe"
import { createStripeCheckoutSession, fetchCustomerId } from "@/lib/aether"
import { AuthenticatedApiHandler, GetSubscriptionResponse, PostSubscriptionResponse } from "@/types"
import { error, withSession } from "@/utils/api-handler-utils"
import { stripe as stripeConstants } from "@/constants"

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
  } catch (e: any) {
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
  })

  const subscriptions = response.data.sort(subscriptionComparator)
  const hasSubscription = subscriptions.some((subscription) =>
    ["trialing", "active", "past_due"].includes(subscription.status),
  )

  if (!hasSubscription) {
    res.json({
      hasSubscription: false,
    })
    return
  }

  const subscription = subscriptions[0]

  let servers = 1
  if (subscription.metadata?.custom_limit)
    servers = parseInt(subscription.metadata?.custom_limit ?? servers.toString(), 10)
  else if (
    subscription.items.data.find(
      (item) =>
        item.price.id == stripeConstants.prices.addon_monthly || item.price.id == stripeConstants.prices.addon_yearly,
    )
  ) {
    const additionalServers = subscription.items.data.find(
      (item) =>
        item.price.id == stripeConstants.prices.addon_monthly || item.price.id == stripeConstants.prices.addon_yearly,
    )
    servers += additionalServers?.quantity ?? 0
  }

  res.json({
    hasSubscription: true,
    subscription: {
      id: subscription.id,
      name: "Fire Premium",
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

const post: AuthenticatedApiHandler<PostSubscriptionResponse> = async (session, _, res) => {
  let stripeSessionId: string
  try {
    stripeSessionId = await createStripeCheckoutSession(session.accessToken)
  } catch (e: any) {
    const errorResponse = createErrorResponse(e)
    return error(res, errorResponse.code, errorResponse.error)
  }

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
