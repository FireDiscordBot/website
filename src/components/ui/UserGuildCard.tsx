import Avatar from "@mui/material/Avatar"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Card, { CardProps } from "@mui/material/Card"
import CardActions from "@mui/material/CardActions"
import CardContent from "@mui/material/CardContent"
import Skeleton from "@mui/material/Skeleton"
import Tooltip from "@mui/material/Tooltip"
import Typography from "@mui/material/Typography"
import { green } from "@mui/material/colors"
import { styled } from "@mui/material/styles"
import { MouseEvent, useMemo } from "react"

import { PremiumDiscordGuild } from "@/interfaces/discord"
import { getGuildIcon } from "@/lib/discord"

interface StyledCard extends CardProps {
  premium: boolean
}

const StyledCard = styled(Card)<StyledCard>(({ theme, premium }) => ({
  height: "100%",
  transition: theme.transitions.create("background-color"),
  ...(premium && {
    backgroundColor: green[800],
  }),
}))

type Props = {
  guild?: PremiumDiscordGuild
  onClickToggle: (guild: PremiumDiscordGuild) => void
}

const UserGuildCard = ({ guild, onClickToggle }: Props) => {
  const avatar = useMemo(() => {
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

  const onClick = (event: MouseEvent) => {
    if (!guild) return
    event.preventDefault()
    onClickToggle(guild)
  }

  return (
    <StyledCard premium={guild?.premium ?? false}>
      <CardContent
        sx={{
          display: "flex",
          alignItems: "center",
          "&:last-child": {
            paddingBottom: (theme) => theme.spacing(2),
          },
        }}
      >
        {avatar}
        <Box overflow="hidden" ml={2}>
          <Typography variant="h6" component="h2" noWrap>
            {guild ? guild.name : <Skeleton width={50} animation="wave" />}
          </Typography>
          <Typography variant="caption">
            {guild ? `Premium: ${guild.premium ? "Yes" : "No"}` : <Skeleton width={50} animation="wave" />}
          </Typography>
        </Box>
      </CardContent>
      <CardActions sx={{ justifyContent: "end" }}>
        {guild?.premium && guild?.managed == null ? (
          <Tooltip arrow placement="top" title="You cannot manage this server's premium status">
            <span>
              <Button size="small" disabled>
                {guild ? "Toggle" : <Skeleton width={40} animation="wave" />}
              </Button>
            </span>
          </Tooltip>
        ) : (
          <Button size="small" onClick={onClick}>
            {guild ? "Toggle" : <Skeleton width={40} animation="wave" />}
          </Button>
        )}
      </CardActions>
    </StyledCard>
  )
}

export default UserGuildCard
