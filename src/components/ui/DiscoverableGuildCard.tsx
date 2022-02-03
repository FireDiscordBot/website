import Avatar from "@mui/material/Avatar"
import Card from "@mui/material/Card"
import CardActionArea from "@mui/material/CardActionArea"
import CardContent from "@mui/material/CardContent"
import CardMedia from "@mui/material/CardMedia"
import Skeleton from "@mui/material/Skeleton"
import Typography from "@mui/material/Typography"
import { styled } from "@mui/material/styles"

import type { DiscoverableGuild } from "@/interfaces/aether"
import { formatNumber } from "@/utils/formatting"

const StyledCard = styled(Card)({
  height: "100%",
})

const StyledCardMedia = styled(CardMedia)({
  height: "200px",
})

const StyledCardContent = styled(CardContent)({
  display: "flex",
  alignItems: "center",
})

const CardText = styled("div")(({ theme }) => ({
  marginLeft: theme.spacing(2),
  overflow: "hidden",
}))

// const domain =
//   process.env.NODE_ENV == "development" ? "http://localhost:1338/v2/discoverable/join" : "https://discover-v2.inv.wtf"

// type JoinRequestResponse = { error: string; code: number } | { error: null; invite: Invite }

interface DiscoverableGuildCardProps {
  guild?: DiscoverableGuild
}

const DiscoverableGuildCard = ({ guild }: DiscoverableGuildCardProps) => {
  if (!guild) {
    return (
      <Skeleton animation="wave">
        <StyledCard>
          <StyledCardMedia image={""} title={"Unavailable Guild"} />
          <StyledCardContent>
            <Avatar />
            <CardText>
              <Typography variant="h6" component="h2" noWrap>
                Long string of text to make the card wider lol
              </Typography>
              <Typography variant="body2" color="textSecondary" component="p">
                0 Members
              </Typography>
            </CardText>
          </StyledCardContent>
        </StyledCard>
      </Skeleton>
    )
  }

  return (
    <StyledCard>
      <CardActionArea
        onClick={async () => {
          // TODO
          // const request = await requestJoin(guild).catch(() => {
          //   emitter.emit("NOTIFICATION", {
          //     text: "Failed to fetch invite",
          //     severity: "error",
          //     horizontal: "right",
          //     vertical: "top",
          //     autoHideDuration: 5000,
          //   })
          //   return null
          // })
          // if (!request) return
          // if (request.error != null) {
          //   if (request.code == 403 && request.error == "FORBIDDEN")
          //     emitter.emit("NOTIFICATION", {
          //       text: "You cannot join this server",
          //       severity: "error",
          //       horizontal: "right",
          //       vertical: "top",
          //       autoHideDuration: 5000,
          //     })
          //   else if (request.code == 401 && typeof window != "undefined")
          //     window.open(`${domain}/${guild.id}/${handler?.session}`, "_blank")
          //   else
          //     emitter.emit("NOTIFICATION", {
          //       text: request.error,
          //       severity: "error",
          //       horizontal: "right",
          //       vertical: "top",
          //       autoHideDuration: 5000,
          //     })
          // } else if (request.invite && typeof window != "undefined")
          //   window.open(`https://discord.com/invite/${request.invite.code}`, "_blank")
          // else
          //   emitter.emit("NOTIFICATION", {
          //     text: "An unknown error occurred",
          //     severity: "error",
          //     horizontal: "right",
          //     vertical: "top",
          //     autoHideDuration: 5000,
          //   })
        }}
      >
        <StyledCardMedia image={guild.splash} title={guild.name} />
        <StyledCardContent>
          <Avatar src={guild.icon} />
          <CardText>
            <Typography variant="h6" component="h2" noWrap>
              {guild.name}
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
              {formatNumber(guild.members)} Members
            </Typography>
          </CardText>
        </StyledCardContent>
      </CardActionArea>
    </StyledCard>
  )
}

// const requestJoin = async (guild: DiscoverableGuild): Promise<JoinRequestResponse> =>
//   new Promise((resolve, reject) => {
//     if (!handler) return resolve({ error: "NO_HANDLER", code: 500 })
//     const nonce = (+new Date()).toString()
//     handler.websocket?.handlers.set(nonce, resolve)
//     handler.sendGuildJoinRequest(guild.id, nonce)

//     setTimeout(() => {
//       if (handler.websocket?.handlers.has(nonce)) {
//         handler.websocket.handlers.delete(nonce)
//         reject("Join request timed out")
//       }
//     }, 10000)
//   })

export default DiscoverableGuildCard