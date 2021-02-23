import * as React from "react"
import Card from "@material-ui/core/Card"
import CardActionArea from "@material-ui/core/CardActionArea"
import CardContent from "@material-ui/core/CardContent"
import CardMedia from "@material-ui/core/CardMedia"
import Typography from "@material-ui/core/Typography"
import Avatar from "@material-ui/core/Avatar"
import { createStyles, makeStyles } from "@material-ui/core/styles"

import { DiscoverableGuild } from "@/interfaces/aether"
import { formatNumber } from "@/utils/formatting"

const useStyles = makeStyles((theme) =>
  createStyles({
    fullHeight: {
      height: "100%",
    },
    media: {
      height: "200px",
    },
    content: {
      display: "flex",
      alignItems: "center",
    },
    cardText: {
      marginLeft: theme.spacing(2),
      overflow: "hidden",
    },
  }),
)

type Props = {
  guild: DiscoverableGuild
}

const DiscoverableGuildCard = ({ guild }: Props) => {
  const classes = useStyles()
  return (
    <Card className={classes.fullHeight}>
      <CardActionArea href={guild.vanity}>
        <CardMedia className={classes.media} image={guild.splash} title={guild.name} />
        <CardContent className={classes.content}>
          <Avatar src={guild.icon} />
          <div className={classes.cardText}>
            <Typography variant="h6" component="h2" noWrap>
              {guild.name}
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
              {formatNumber(guild.members)} Members
            </Typography>
          </div>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

export default DiscoverableGuildCard
