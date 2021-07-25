import * as React from "react"
import Card from "@material-ui/core/Card"
import CardActionArea from "@material-ui/core/CardActionArea"
import CardContent from "@material-ui/core/CardContent"
import CardMedia from "@material-ui/core/CardMedia"
import Typography from "@material-ui/core/Typography"
import Avatar from "@material-ui/core/Avatar"
import { createStyles, makeStyles } from "@material-ui/core/styles"
import Skeleton from "@material-ui/lab/Skeleton"

import { DiscoverableGuild } from "@/interfaces/aether"
import { formatNumber } from "@/utils/formatting"
import { Invite } from "@/interfaces/discord"
import { emitter, handler } from "@/pages/_app"

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
  guild?: DiscoverableGuild
}

type JoinRequestResponse = { error: string; code: number } | { error: null; invite: Invite }

const domain = process.env.NODE_ENV == "development" ? "test.inv.wtf/join" : "discover.inv.wtf"

const DiscoverableGuildCard = ({ guild }: Props) => {
  const classes = useStyles()
  if (!guild)
    return (
      <Skeleton animation="wave">
        <Card className={classes.fullHeight}>
          <CardMedia className={classes.media} image={""} title={"Unavailable Guild"} />
          <CardContent className={classes.content}>
            <Avatar />
            <div className={classes.cardText}>
              <Typography variant="h6" component="h2" noWrap>
                Long string of text to make the card wider lol
              </Typography>
              <Typography variant="body2" color="textSecondary" component="p">
                0 Members
              </Typography>
            </div>
          </CardContent>
        </Card>
      </Skeleton>
    )
  return (
    <Card className={classes.fullHeight}>
      <CardActionArea
        onClick={async () => {
          const request = await requestJoin(guild).catch(() => {
            emitter.emit("NOTIFICATION", {
              text: "Failed to fetch invite",
              severity: "error",
              horizontal: "right",
              vertical: "top",
              autoHideDuration: 5000,
            })
            return null
          })
          if (!request) return
          if (request.error != null) {
            if (request.code == 403 && request.error == "FORBIDDEN")
              emitter.emit("NOTIFICATION", {
                text: "You cannot join this server",
                severity: "error",
                horizontal: "right",
                vertical: "top",
                autoHideDuration: 5000,
              })
            else if (request.code == 401 && typeof window != "undefined")
              window.location.href = `https://${domain}/${guild.id}`
            else
              emitter.emit("NOTIFICATION", {
                text: request.error,
                severity: "error",
                horizontal: "right",
                vertical: "top",
                autoHideDuration: 5000,
              })
          } else if (request.invite && typeof window != "undefined")
            window.location.href = `https://discord.com/invite/${request.invite.code}`
          else
            emitter.emit("NOTIFICATION", {
              text: "An unknown error occurred",
              severity: "error",
              horizontal: "right",
              vertical: "top",
              autoHideDuration: 5000,
            })
        }}
      >
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

const requestJoin = async (guild: DiscoverableGuild): Promise<JoinRequestResponse> =>
  new Promise((resolve, reject) => {
    if (!handler) return resolve({ error: "NO_HANDLER", code: 500 })
    const nonce = (+new Date()).toString()
    handler.websocket?.handlers.set(nonce, resolve)
    handler.sendGuildJoinRequest(guild.id, nonce)

    setTimeout(() => {
      if (handler.websocket?.handlers.has(nonce)) {
        handler.websocket.handlers.delete(nonce)
        reject("Join request timed out")
      }
    }, 10000)
  })

export default DiscoverableGuildCard
