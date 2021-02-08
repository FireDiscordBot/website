import * as React from 'react'
import { GetServerSideProps } from "next"
import Container from "@material-ui/core/Container"
import Grid from "@material-ui/core/Grid"
import Layout from "@/components/Layout"
import DiscoverableGuildCard from "@/components/DiscoverableGuildCard"
import { DiscoverableGuild } from "@/interfaces/aether"
import { fire } from "../src/constants"

type Props = {
  guilds: DiscoverableGuild[];
}

// TODO: implement pagination or infinite scrolling
const DiscoverPage = ({ guilds }: Props) => (
  <Layout>
    <Container>
      <Grid container spacing={4}>
        {guilds.map((guild, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <DiscoverableGuildCard guild={guild}/>
          </Grid>
        ))}
      </Grid>
    </Container>
  </Layout>
)

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  let guilds: DiscoverableGuild[]

  try {
    const response = await fetch(`${fire.aetherApiUrl}/discoverable`, {
      mode: 'cors',
      headers: { "User-Agent": "Fire Website" },
    })
    guilds = await response.json()
  } catch (e) {
    guilds = []
  }

  return {
    props: {
      guilds,
    },
  }
}

export default DiscoverPage
