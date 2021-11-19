import Stripe from "stripe"

import stripe from "@/api/server-stripe"
import { Plan } from "@/interfaces/fire"

export const fetchPlans = async () => {
  const pricesList = await stripe.prices.list({
    active: true,
    type: "recurring",
    recurring: {
      interval: "month",
    },
    expand: ["data.product"],
  })

  const plans: Plan[] = pricesList.data
    .map((price) => {
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
