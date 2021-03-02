import * as React from "react"
import { GetStaticProps } from "next"
import Container from "@material-ui/core/Container"
import Grid from "@material-ui/core/Grid"

import { emitter } from "./_app"

import fetcher from "@/utils/fetcher"
import DefaultLayout from "@/layouts/default"
import DiscoverableGuildCard from "@/components/DiscoverableGuildCard"
import { DiscoverableGuild } from "@/interfaces/aether"
import { fire } from "@/constants"

type Props = {
  initialGuilds: DiscoverableGuild[]
}

// TODO: implement pagination or infinite scrolling
// maybe add error message when no guilds are found?
const DiscoverPage = ({ initialGuilds }: Props) => {
  const [guilds, setGuilds] = React.useState<DiscoverableGuild[]>(initialGuilds)

  if (guilds.length)
    emitter.emit(
      "SUBSCRIBE",
      "/discover",
      guilds.map((guild) => guild.id),
    )

  React.useEffect(() => {
    emitter.removeAllListeners("DISCOVERY_UPDATE")
    emitter.on("DISCOVERY_UPDATE", setGuilds)
  }, [guilds])

  return (
    <DefaultLayout title="Discover">
      <Container>
        <Grid container spacing={4}>
          {guilds.map((guild, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <DiscoverableGuildCard guild={guild} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </DefaultLayout>
  )
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  let guilds: DiscoverableGuild[]

  try {
    guilds = await fetcher(`${fire.aetherApiUrl}/discoverable`, {
      mode: "cors",
      headers: { "User-Agent": "Fire Website" },
    })
  } catch (e) {
    guilds = []
  }

  return {
    props: {
      initialGuilds: guilds,
    },
    revalidate: 300,
  }
}

export default DiscoverPage
