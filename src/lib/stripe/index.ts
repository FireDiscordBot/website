import Stripe from "stripe"

import { stripe as stripeConstants } from "@/constants"
import { isBrowser } from "@/utils/is-browser"

if (!stripeConstants.secretKey) {
  throw Error("Env variable STRIPE_API_SECRET_KEY not defined")
}

if (isBrowser()) {
  throw Error("Tried to import a server side module on client")
}

/** Stripe instance only intended for Server Side use. */
const stripe = new Stripe.Stripe(stripeConstants.secretKey, {
  apiVersion: "2020-08-27",
})

export default stripe
