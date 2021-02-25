import Skeleton from "@material-ui/lab/Skeleton"
import * as React from "react"
import clsx from "clsx"
import { green } from "@material-ui/core/colors"
import Button from "@material-ui/core/Button"
import Card from "@material-ui/core/Card"
import CardContent from "@material-ui/core/CardContent"
import CardActions from "@material-ui/core/CardActions"
import Typography from "@material-ui/core/Typography"
import Avatar from "@material-ui/core/Avatar"
import { createStyles, makeStyles } from "@material-ui/core/styles"

import { getGuildIcon } from "@/utils/discord"
import { UserGuild } from "@/interfaces/aether"

const useStyles = makeStyles((theme) =>
  createStyles({
    card: {
      height: "100%",
      transition: theme.transitions.create("background-color"),
    },
    content: {
      display: "flex",
      alignItems: "center",
      "&:last-child": {
        paddingBottom: theme.spacing(2),
      },
    },
    cardText: {
      marginLeft: theme.spacing(2),
      overflow: "hidden",
    },
    actions: {
      justifyContent: "end",
    },
    premiumCard: {
      backgroundColor: green[800],
    },
  }),
)

type Props = {
  guild?: UserGuild
  onClickToggle: (guild: UserGuild) => void
}

const UserGuildCard = ({ guild, onClickToggle }: Props) => {
  const classes = useStyles()
  const avatar = React.useMemo(() => {
    if (!guild) {
      return (
        <Skeleton animation="wave">
          <Avatar />
        </Skeleton>
      )
    }

    const guildIcon = getGuildIcon(guild)
    return guildIcon.type == "text" ? <Avatar>{guildIcon.value}</Avatar> : <Avatar src={guildIcon.value} />
  }, [guild])

  const onClick = (event: React.MouseEvent) => {
    if (!guild) return
    event.preventDefault()
    onClickToggle(guild)
  }

  return (
    <Card
      className={clsx(classes.card, {
        [classes.premiumCard]: guild?.premium ?? false,
      })}
    >
      <CardContent className={classes.content}>
        {avatar}
        <div className={classes.cardText}>
          <Typography variant="h6" component="h2" noWrap>
            {guild ? guild.name : <Skeleton width={50} animation="wave" />}
          </Typography>
          <Typography variant="caption">
            {guild ? `Premium: ${guild.premium ? "Yes" : "No"}` : <Skeleton width={50} animation="wave" />}
          </Typography>
        </div>
      </CardContent>
      <CardActions className={classes.actions}>
        <Button color="default" size="small" onClick={onClick}>
          {guild ? "Toggle" : <Skeleton width={40} animation="wave" />}
        </Button>
      </CardActions>
    </Card>
  )
}

export default UserGuildCard
