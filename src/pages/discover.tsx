import * as React from "react"
import Container from "@material-ui/core/Container"
import Grid from "@material-ui/core/Grid"
import Box from "@material-ui/core/Box"
import { TextField, Typography } from "@material-ui/core"
import { Pagination } from "@material-ui/lab"

import { emitter } from "./_app"

import DefaultLayout from "@/layouts/default"
import DiscoverableGuildCard from "@/components/DiscoverableGuildCard"
import { DiscoverableGuild, DiscoveryUpdateOp } from "@/interfaces/aether"
import Loading from "@/components/loading"

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

const getSortedGuilds = (guilds: DiscoverableGuild[], sortIds: string[], includeFeatured = false) =>
  guilds
    .sort(
      (a, b) =>
        (sortIds.includes(a.id) ? sortIds.indexOf(a.id) : 2) - (sortIds.includes(b.id) ? sortIds.indexOf(b.id) : 2),
    )
    .filter((g) => (includeFeatured ? g : !g.featured))

// stolen from https://stackoverflow.com/a/57697857 lol
const paginate = function (array: DiscoverableGuild[], index: number, size: number) {
  // transform values
  index = Math.abs(index)
  index = index > 0 ? index - 1 : index
  size = size < 1 ? 1 : size

  // filter
  return [
    ...array.filter((_, n) => {
      return n >= index * size && n < (index + 1) * size
    }),
  ]
}

const DiscoverPage = () => {
  const [sortIds, setSortIds] = React.useState<string[] | null>(null)
  const [guilds, setGuilds] = React.useState<DiscoverableGuild[]>([])
  const [initialGuilds, setInitialGuilds] = React.useState<DiscoverableGuild[]>([])

  const [page, setPage] = React.useState(1)

  const handleChangePage = (_: unknown, page: number) => {
    setPage(page)
  }

  React.useEffect(() => {
    const setGuildsWithSort = (updated: DiscoverySync | DiscoverableGuild[]) => {
      if (Array.isArray(updated)) {
        // this will always be sending the full list and usually only on the first load
        // so we'll just set the initialGuilds to the full list.

        if (sortIds == null) {
          updated = shuffleArray(updated)
            setSortIds(updated.map((guild) => guild.id))
        }
        const sorted = getSortedGuilds(updated, sortIds ?? [], true)
        setInitialGuilds(sorted)
        setGuilds(sorted)

        // if a filter is currently applied, this will reset the list to be unfiltered
        // so we reset the textbox value too
        if (typeof document != "undefined" && document.getElementById("guild-filter") != null)
          (document.getElementById("guild-filter") as HTMLInputElement).value = ""
      } else if (guilds && updated.guilds.length) {
        switch (updated.op) {
          case DiscoveryUpdateOp.SYNC: {
            const newGuilds = [...guilds]
            for (const guild of updated.guilds) {
              const index = newGuilds?.findIndex((g) => g.id == guild.id)
              if (typeof index == "number") newGuilds[index] = guild
            }
            setGuilds(newGuilds)
            break
          }
          case DiscoveryUpdateOp.ADD: {
            const newGuilds = shuffleArray(updated.guilds)

            // prevent duplicates
            setInitialGuilds(initialGuilds.filter((g) => !newGuilds.find((u) => u.id == g.id)))

            setGuilds([...guilds.filter((g) => !newGuilds.find((u) => u.id == g.id)), ...newGuilds])
            if (sortIds) setSortIds([...sortIds, ...newGuilds.map((guild) => guild.id)])
            else setSortIds(newGuilds.map((guild) => guild.id))
            setInitialGuilds([...initialGuilds, ...newGuilds])
            break
          }
          case DiscoveryUpdateOp.REMOVE: {
            const removeGuilds = updated.guilds

            setGuilds(guilds.filter((g) => !removeGuilds.find((u) => u.id == g.id)))
            if (sortIds) setSortIds(sortIds.filter((id) => !removeGuilds.find((u) => u.id == id)) ?? [])
            setInitialGuilds(initialGuilds.filter((g) => !removeGuilds.find((u) => u.id == g.id)))
            break
          }
          case DiscoveryUpdateOp.ADD_OR_SYNC: {
            const newGuilds = [...guilds]
            const newSortIds = sortIds ? [...sortIds] : []
            const newInitialGuilds = [...initialGuilds]
            for (const guild of updated.guilds) {
              if (newGuilds.find((g) => g.id == guild.id)) {
                const index = newGuilds.findIndex((g) => g.id == guild.id)
                if (typeof index == "number") newGuilds[index] = guild
              } else if (newInitialGuilds.find((g) => g.id == guild.id)) {
                const initialIndex = newInitialGuilds.findIndex((g) => g.id == guild.id)
                if (typeof initialIndex == "number") newInitialGuilds[initialIndex] = guild
              } else {
                newGuilds.push(guild)
                newInitialGuilds.push(guild)
                newSortIds.push(guild.id)
              }
            }
            setGuilds(newGuilds)
            setInitialGuilds(newInitialGuilds)
            if (!sortIds || sortIds.length != newSortIds.length) setSortIds(newSortIds)
            break
          }
        }
      }
    }
    emitter.removeAllListeners("DISCOVERY_UPDATE")
    emitter.on("DISCOVERY_UPDATE", setGuildsWithSort)
  }, [guilds, initialGuilds, sortIds])

  const handleTextChange = (value: string | null | undefined) => {
    if (!value) return setGuilds(getSortedGuilds(initialGuilds ?? [], sortIds ?? []))

    const filteredGuilds =
      initialGuilds?.filter((guild) => guild.name.toLowerCase().includes(value.toLowerCase())) || []
    if (page > Math.ceil(filteredGuilds.length / 12)) setPage(Math.ceil(filteredGuilds.length / 12))
    setGuilds(getSortedGuilds(filteredGuilds, sortIds ?? [], true))
  }

  return (
    <DefaultLayout title="Discover">
      <Container>
        <Box mb={2}>
          <TextField
            id="guild-filter"
            onChange={(value) => handleTextChange(value.target.value)}
            fullWidth
            placeholder={"Find a server..."}
          />
        </Box>
        {guilds.filter((g) => g.featured).length > 0 &&
          !(document.getElementById("guild-filter") as HTMLInputElement)?.value.length && (
            <Box mb={2}>
              <Typography variant="h4" gutterBottom>
                Featured Servers
              </Typography>
              <Grid container spacing={4}>
                {guilds
                  .filter((g) => g.featured)
                  .map((guild, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <DiscoverableGuildCard guild={guild} />
                    </Grid>
                  ))}
              </Grid>
            </Box>
          )}
        {sortIds == null ? (
          <Loading />
        ) : (
          <Box mb={2}>
            {guilds.filter((g) => !g.featured).length > 0 && (
              <Typography variant="h4" gutterBottom>
                {(document.getElementById("guild-filter") as HTMLInputElement)?.value.length
                  ? "Matching Servers"
                  : "All Servers"}
              </Typography>
            )}
            <Grid container spacing={4}>
              {paginate(
                guilds.filter((g) => !g.featured),
                page,
                9,
              ).map((guild, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <DiscoverableGuildCard guild={guild} />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
        {(guilds?.length || 0) > 9 && (
          <Pagination
            style={{ marginTop: 15, display: "flex", alignItems: "center", justifyContent: "center" }}
            count={Math.ceil((guilds?.length || 0) / 9)}
            onChange={handleChangePage}
            variant="outlined"
          />
        )}
      </Container>
    </DefaultLayout>
  )
}

export default DiscoverPage
