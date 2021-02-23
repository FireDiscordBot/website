import * as React from "react"
import { GetStaticProps } from "next"
import Container from "@material-ui/core/Container"
import Grid from "@material-ui/core/Grid"

import fetcher from "@/utils/fetcher"
import Default from "@/layouts/default"
import DiscoverableGuildCard from "@/components/DiscoverableGuildCard"
import { DiscoverableGuild } from "@/interfaces/aether"
import { fire } from "@/constants"

type Props = {
  guilds: DiscoverableGuild[]
}

// TODO: implement pagination or infinite scrolling
const DiscoverPage = ({ guilds }: Props) => (
  <Default>
    <Container>
      <Grid container spacing={4}>
        {guilds.map((guild, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <DiscoverableGuildCard guild={guild} />
          </Grid>
        ))}
      </Grid>
    </Container>
  </Default>
)

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
      guilds,
    },
    revalidate: 300,
  }
}

export default DiscoverPage
