import * as React from "react"
import Card from "@material-ui/core/Card"
import CardContent from "@material-ui/core/CardContent"
import CardActions from "@material-ui/core/CardActions"
import Typography from "@material-ui/core/Typography"
import Button from "@material-ui/core/Button"
import { loadStripe } from "@stripe/stripe-js"
import { Plan } from "@/interfaces/fire"

if (!process.env.NEXT_PUBLIC_STRIPE_API_PUBLIC_KEY) {
  throw Error("Env variable NEXT_PUBLIC_STRIPE_API_PUBLIC_KEY not defined")
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_API_PUBLIC_KEY)

type Props = {
  plan: Plan
}

const PlanCard = ({ plan }: Props) => {
  const onClickChangePlan = async (event: React.MouseEvent) => {
    event.preventDefault()
    const stripe = await stripePromise

    const response = await fetch(`/api/user/subscription?servers=${plan.servers}`, {
      method: "POST",
    })
    const json = await response.json()

    const error = await stripe?.redirectToCheckout({
      sessionId: json.sessionId,
    })

    console.log(error?.error)
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h5">{plan.name}</Typography>
      </CardContent>
      <CardActions>
        <Button color="primary" onClick={onClickChangePlan}>
          Change plan
        </Button>
      </CardActions>
    </Card>
  )
}

export default PlanCard
