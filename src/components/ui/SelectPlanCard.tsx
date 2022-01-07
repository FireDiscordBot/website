import Avatar from "@mui/material/Avatar"
import Dialog from "@mui/material/Dialog"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemAvatar from "@mui/material/ListItemAvatar"
import ListItemText from "@mui/material/ListItemText"

import DialogTitle from "./DialogTitle"

import useAvailablePlans from "@/hooks/use-available-plans"
import { PremiumPlan } from "@/lib/stripe/types"
import { formatNumber } from "@/utils/formatting"

interface SelectPlanCardProps {
  open: boolean
  onClose: () => void
  onClickPlan: (plan: PremiumPlan) => void
  loadPlans: boolean
}

const SelectPlanCard = ({ open, onClose, onClickPlan, loadPlans }: SelectPlanCardProps) => {
  // TODO: stop using SWR here
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
