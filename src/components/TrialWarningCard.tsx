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

const TrialWarningCard = ({ open, onClose, onContinue, guild }: Props) => {
  if (!guild) return <></>
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle onClose={onClose}>Warning</DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          If you continue, you will not be able to toggle premium again for {guild.name} until your trial is over.
          <br />
          <br />
          Only toggle it if you are sure you wish to remove premium from this server!
        </Typography>
      </DialogContent>
      <Button size="large" onClick={onContinue}>
        Toggle
      </Button>
    </Dialog>
  )
}

export default TrialWarningCard
