import Stripe from "stripe"

const stripe = new Stripe.Stripe(process.env.STRIPE_API_KEY_SECRET!!, {
  apiVersion: "2020-08-27",
})

type CreateSubscriptionOptions = {
  priceId: string;
  quantity: number;
  successUrl: string;
  cancelUrl: string;
  paymentMethods?: Stripe.Checkout.SessionCreateParams.PaymentMethodType[];
  metadata?: Stripe.MetadataParam;
}

export const createSubscription = async (options: CreateSubscriptionOptions) => {
  return stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: options.paymentMethods ?? ['card'],
    line_items: [
      {
        price: options.priceId,
        quantity: options.quantity,
      },
    ],
    success_url: options.successUrl,
    cancel_url: options.cancelUrl,
    metadata: options.metadata,
  })
}
