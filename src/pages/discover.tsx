import * as React from "react"
import Container from "@material-ui/core/Container"
import Grid from "@material-ui/core/Grid"

import { emitter } from "./_app"

import Loading from "@/components/loading"
import DefaultLayout from "@/layouts/default"
import DiscoverableGuildCard from "@/components/DiscoverableGuildCard"
import { DiscoverableGuild, DiscoveryUpdateOp } from "@/interfaces/aether"

interface DiscoverySync {
  op: DiscoveryUpdateOp
  guilds: DiscoverableGuild[]
}

export function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

const getSortedGuilds = (guilds: DiscoverableGuild[], sortIds: string[]) =>
  guilds.sort(
    (a, b) =>
      (sortIds.includes(a.id) ? sortIds.indexOf(a.id) : 2) - (sortIds.includes(b.id) ? sortIds.indexOf(b.id) : 2),
  )

// TODO: implement pagination or infinite scrolling
// maybe add error message when no guilds are found?
const DiscoverPage = () => {
  const [sortIds, setSortIds] = React.useState<string[] | null>(null)
  const [guilds, setGuilds] = React.useState<DiscoverableGuild[] | null>(null)

  React.useEffect(() => {
    const setGuildsWithSort = (updated: DiscoverySync | DiscoverableGuild[]) => {
      if (Array.isArray(updated)) {
        setGuilds(getSortedGuilds(updated, sortIds ?? []))
        setSortIds(updated?.map((guild) => guild.id) ?? [])
      } else if (guilds && sortIds) {
        switch (updated.op) {
          case DiscoveryUpdateOp.SYNC: {
            const newGuilds = [...guilds]
            for (const guild of updated.guilds) {
              const index = guilds?.findIndex((g) => g.id == guild.id)
              if (typeof index == "number") newGuilds[index] = guild
            }
            setGuilds(newGuilds)
            break
          }
          case DiscoveryUpdateOp.ADD: {
            const newGuilds = [...guilds]
            const newSortIds = [...sortIds]
            newGuilds?.push(...updated.guilds)
            newSortIds?.push(...updated.guilds.map((guild) => guild.id))
            setGuilds(newGuilds)
            setSortIds(newSortIds)
            break
          }
          case DiscoveryUpdateOp.REMOVE: {
            let newGuilds = [...guilds]
            for (const guild of updated.guilds) newGuilds = newGuilds.filter((g) => g.id != guild.id)
            setGuilds(newGuilds)
            setSortIds(newGuilds.map((guild) => guild.id) ?? [])
            break
          }
        }
      }
    }
    emitter.removeAllListeners("DISCOVERY_UPDATE")
    emitter.on("DISCOVERY_UPDATE", setGuildsWithSort)
  }, [guilds, sortIds])

  return (
    <DefaultLayout title="Discover">
      <Container>
        {guilds == null || sortIds == null ? (
          <Loading />
        ) : (
          <Grid container spacing={4}>
            {getSortedGuilds(guilds, sortIds).map((guild, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <DiscoverableGuildCard guild={guild} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </DefaultLayout>
  )
}

export default DiscoverPage
