import DialogTitle from "@/components/DialogTitle"
import { PremiumDiscordGuild } from "@/interfaces/discord"
import { DialogContent } from "@mui/material"
import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import Typography from "@mui/material/Typography"
import * as React from "react"

type Props = {
  open: boolean
  onClose: () => void
  onContinue: () => void
  guild: PremiumDiscordGuild | null
}

const ServerLimitCard = ({ open, onClose, onContinue, guild }: Props) => {
  if (!guild) return <></>
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle onClose={onClose}>Warning</DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          Yoiu have reached the maximum number of servers you can give premium to for your plan.
          <br />
          <br />
          You can add additional servers by updating your plan in the billing portal.
        </Typography>
      </DialogContent>
      <Button size="large" onClick={onContinue}>
        Billing Portal
      </Button>
    </Dialog>
  )
}

export default ServerLimitCard
