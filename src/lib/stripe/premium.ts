import Stripe from "stripe"

import { PremiumPlan } from "./types"

import stripe from "@/lib/stripe"

export const fetchPlans = async (): Promise<PremiumPlan[]> => {
  const pricesList = await stripe.prices.list({
    active: true,
    type: "recurring",
    recurring: {
      interval: "month",
    },
    expand: ["data.product"],
  })

  const plans = pricesList.data
    .map((price): PremiumPlan => {
      const product = price.product as Stripe.Product
      return {
        id: price.id,
        name: product.name,
        images: product.images,
        amount: price.unit_amount ?? 0,
        currency: price.currency,
        servers: parseInt(product.metadata.servers, 10),
        hidden: product.metadata.hidden === "true",
      }
    })
    .sort((a, b) => a.servers - b.servers)

  return plans
}
