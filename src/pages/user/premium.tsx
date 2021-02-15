import * as React from "react"
import Card from "@material-ui/core/Card"
import CardContent from "@material-ui/core/CardContent"
import Typography from "@material-ui/core/Typography"
import UserPage from "../../layouts/user-page"
import { Plan } from "@/interfaces/fire"
import { fire } from "@/constants"

type PlanCardProps = {
  plan: Plan
}

const PlanCard = ({ plan }: PlanCardProps) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5">{plan.name}</Typography>
      </CardContent>
    </Card>
  )
}

const AccountPage = () => {
  return (
    <UserPage>
      {fire.plans.map((plan, i) => (
        <PlanCard plan={plan} key={i} />
      ))}
    </UserPage>
  )
}

export default AccountPage
