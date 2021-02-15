import Stripe from "stripe"

if (!process.env.STRIPE_API_SECRET_KEY) {
  throw Error("Env variable STRIPE_API_SECRET_KEY not defined")
}

const stripe = new Stripe.Stripe(process.env.STRIPE_API_SECRET_KEY, {
  apiVersion: "2020-08-27",
})

export const fetchSubscriptions = (customerId: string) =>
  stripe.subscriptions.list({
    customer: customerId,
  })
