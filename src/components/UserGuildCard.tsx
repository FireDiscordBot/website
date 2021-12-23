import Skeleton from "@mui/material/Skeleton"
import * as React from "react"
import { green } from "@mui/material/colors"
import Button from "@mui/material/Button"
import Card, { CardProps } from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import CardActions from "@mui/material/CardActions"
import Typography from "@mui/material/Typography"
import Avatar from "@mui/material/Avatar"
import Box from "@mui/material/Box"
import { styled } from "@mui/material/styles"

import { getGuildIcon } from "@/utils/discord"
import { UserGuild } from "@/interfaces/aether"

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
  guild?: UserGuild
  onClickToggle: (guild: UserGuild) => void
}

const UserGuildCard = ({ guild, onClickToggle }: Props) => {
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
        <Button size="small" onClick={onClick}>
          {guild ? "Toggle" : <Skeleton width={40} animation="wave" />}
        </Button>
      </CardActions>
    </StyledCard>
  )
}

export default UserGuildCard
