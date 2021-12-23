import * as React from "react"
import Accordion from "@mui/material/Accordion"
import AccordionSummary from "@mui/material/AccordionSummary"
import Typography from "@mui/material/Typography"
import AccordionDetails from "@mui/material/AccordionDetails"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"

import { Command } from "@/interfaces/aether"

type Props = {
  command: Command
  prefix: string
}

const CommandAccordion = ({ command, prefix }: Props) => (
  <Accordion>
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
      <Typography
        sx={{ fontSize: (theme) => theme.typography.pxToRem(15), flexBasis: "33.33%", flexShrink: 0 }}
        color="textPrimary"
      >
        {command.name}
      </Typography>
      <Typography sx={{ fontSize: (theme) => theme.typography.pxToRem(15) }} color="textSecondary">
        {command.description}
      </Typography>
    </AccordionSummary>
    <AccordionDetails sx={{ display: "flex", flexDirection: "column" }}>
      <Typography variant="body1" gutterBottom>
        Usage: {command.usage.replace("{prefix}", prefix)}
      </Typography>
      {/* <Typography variant="body1">Aliases: {command.aliases.length == 0 ? "None" : command.aliases}</Typography> */}
    </AccordionDetails>
  </Accordion>
)

export default CommandAccordion
