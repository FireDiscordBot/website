import Avatar from "@material-ui/core/Avatar"
import * as React from "react"
import Dialog from "@material-ui/core/Dialog"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemText from "@material-ui/core/ListItemText"
import ListItemAvatar from "@material-ui/core/ListItemAvatar"

import { formatNumber } from "@/utils/formatting"
import { Plan } from "@/interfaces/fire"
import useAvailablePlans from "@/hooks/use-available-plans"
import DialogTitle from "@/components/DialogTitle"

type Props = {
  open: boolean
  onClose: () => void
  onClickPlan: (plan: Plan) => void
  loadPlans: boolean
}

const SelectPlanCard = ({ open, onClose, onClickPlan, loadPlans }: Props) => {
  const { plans } = useAvailablePlans(loadPlans, {
    revalidateOnFocus: false,
  })

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle onClose={onClose}>Plans</DialogTitle>
      <List>
        {plans
          ?.filter((plan) => !plan.hidden)
          .map((plan, index) => {
            const onClick = () => onClickPlan(plan)
            return (
              <ListItem button key={index} onClick={onClick}>
                <ListItemAvatar>
                  <Avatar src={plan.images[0]} />
                </ListItemAvatar>
                <ListItemText
                  primary={plan.name}
                  secondary={`${formatNumber(plan.amount / 100, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })} ${plan.currency.toUpperCase()}`}
                />
              </ListItem>
            )
          })}
      </List>
    </Dialog>
  )
}

export default SelectPlanCard
