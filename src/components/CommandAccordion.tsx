import * as React from "react"
import Accordion from "@material-ui/core/Accordion"
import AccordionSummary from "@material-ui/core/AccordionSummary"
import Typography from "@material-ui/core/Typography"
import AccordionDetails from "@material-ui/core/AccordionDetails"
import { createStyles, makeStyles } from "@material-ui/core/styles"
import ExpandMoreIcon from "@material-ui/icons/ExpandMore"
import { Command } from "@/interfaces/aether"

const useStyles = makeStyles((theme) =>
  createStyles({
    heading: {
      fontSize: theme.typography.pxToRem(15),
      flexBasis: "33.33%",
      flexShrink: 0,
    },
    secondaryHeading: {
      fontSize: theme.typography.pxToRem(15),
    },
    details: {
      display: "flex",
      flexDirection: "column",
    },
  }),
)

type Props = {
  command: Command
  prefix: string
}

const CommandAccordion = ({ command, prefix }: Props) => {
  const classes = useStyles()
  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography className={classes.heading} color="textPrimary">
          {command.name}
        </Typography>
        <Typography className={classes.secondaryHeading} color="textSecondary">
          {command.description}
        </Typography>
      </AccordionSummary>
      <AccordionDetails className={classes.details}>
        <Typography variant="body1" gutterBottom>
          Usage: {command.usage.replace("{prefix}", prefix)}
        </Typography>
        <Typography variant="body1">Aliases: {command.aliases.length == 0 ? "None" : command.aliases}</Typography>
      </AccordionDetails>
    </Accordion>
  )
}

export default CommandAccordion
