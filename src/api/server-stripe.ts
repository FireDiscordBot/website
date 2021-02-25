import Stripe from "stripe"

import { stripe as stripeConstants } from "@/constants"

if (!stripeConstants.secretKey) {
  throw Error("Env variable STRIPE_API_SECRET_KEY not defined")
}

const stripe = new Stripe.Stripe(stripeConstants.secretKey, {
  apiVersion: "2020-08-27",
})

export default stripe
