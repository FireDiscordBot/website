import { useRouter } from "next/router"
import * as React from "react"
import Container from "@material-ui/core/Container"
import Grid from "@material-ui/core/Grid"
import Card from "@material-ui/core/Card"
import CardContent from "@material-ui/core/CardContent"
import Typography from "@material-ui/core/Typography"
import { createStyles, makeStyles } from "@material-ui/core/styles"
import PeopleIcon from "@material-ui/icons/People"
import StorageIcon from "@material-ui/icons/Storage"

import { emitter, handler } from "./_app"

import ClusterStatsDialog from "@/components/ClusterStatsDialog"
import DefaultLayout from "@/layouts/default"
import { ClusterStats, InitialStats } from "@/interfaces/aether"
import { formatBytes, formatNumber } from "@/utils/formatting"
import ClusterCard from "@/components/ClusterCard"
import CircularProgressCard from "@/components/CircularProgressCard"

const useStyles = makeStyles((theme) =>
  createStyles({
    cardContent: {
      display: "flex",
      alignItems: "center",
      flexDirection: "column",
      justifyContent: "center",
      height: "inherit",
    },
    fullHeight: {
      height: "100%",
    },
    icon: {
      fontSize: theme.spacing(10),
    },
    chartsContainer: {
      marginBottom: theme.spacing(2),
    },
    clusterGridItem: {
      display: "flex",
    },
  }),
)

const StatsPage = () => {
  const classes = useStyles()
  const router = useRouter()

  const [initialStats, setInitialStats] = React.useState<InitialStats | undefined>(undefined)
  const [clusterStats, setClusterStats] = React.useState<ClusterStats[]>([])
  const [selectedClusterStats, setSelectedClusterStats] = React.useState<ClusterStats | undefined>(undefined)

  const findClusterStats = React.useCallback(
    (id: number) => {
      return clusterStats.find((cluster) => cluster.id === id)
    },
    [clusterStats],
  )
  const onClickClusterCard = (id: number) => setSelectedClusterStats(findClusterStats(id))
  const onClickClusterError = (id: number) =>
    emitter.emit("NOTIFICATION", {
      text: `Cluster ${id} is currently unavailable`,
      severity: "error",
      horizontal: "right",
      vertical: "top",
      autoHideDuration: 5000,
    })
  const onCloseClusterDialog = () => {
    setSelectedClusterStats(undefined)
    delete router.query.cluster
    window?.history.replaceState(null, "", "/stats")
  }

  React.useEffect(() => {
    emitter.removeAllListeners("REALTIME_STATS")
    emitter.on("REALTIME_STATS", (stats) => {
      const clusterStatsCopy = [...clusterStats]
      if (stats.id == -1) {
        setInitialStats(stats as InitialStats)
        if (!clusterStats.length)
          setClusterStats(
            Array.from({ length: (stats as InitialStats).clusterCount ?? 1 }).map((_, index) => ({
              id: index,
              error: true,
              name: "",
              env: "",
              uptime: "",
              cpu: 0,
              ramBytes: 0,
              totalRamBytes: 0,
              version: "",
              versions: "",
              guilds: 0,
              unavailableGuilds: 0,
              users: 0,
              commands: 0,
              restPing: 0,
              shards: [],
            })),
          )
        else if (clusterStats.length > (stats as InitialStats).clusterCount)
          setClusterStats(clusterStats.slice(0, (stats as InitialStats).clusterCount))
      } else {
        const index = clusterStatsCopy.findIndex((cluster) => cluster.id === stats.id)
        if (index == -1) {
          clusterStatsCopy.push(stats as ClusterStats)
          setClusterStats(clusterStatsCopy)
        } else {
          clusterStatsCopy[index] = stats as ClusterStats
          setClusterStats(clusterStatsCopy)
        }
      }
      // @ts-ignore
      if (handler) handler.cachedStats = clusterStats
    })
  }, [clusterStats, initialStats?.clusterCount])

  React.useEffect(() => {
    if (typeof router.query.cluster === "string") {
      const clusterId = parseInt(router.query.cluster, 10)
      setSelectedClusterStats(findClusterStats(clusterId))
      window?.history.replaceState(null, "", `/stats?cluster=${clusterId}`)
    }
  }, [findClusterStats, router.query, selectedClusterStats])

  React.useEffect(() => {
    if (selectedClusterStats) {
      setSelectedClusterStats(findClusterStats(selectedClusterStats.id))
      window?.history.replaceState(null, "", `/stats?cluster=${selectedClusterStats.id}`)
    }
  }, [findClusterStats, clusterStats, selectedClusterStats])

  return (
    <DefaultLayout title="Stats">
      <Container>
        <Grid container spacing={4} justifyContent="center" className={classes.chartsContainer}>
          <Grid item xs={6} sm={5} md={3}>
            <CircularProgressCard title="CPU" value={clusterStats.map((c) => c.cpu).reduce((a, b) => a + b, 0)} />
          </Grid>
          <Grid item xs={6} sm={5} md={3}>
            <CircularProgressCard
              title="RAM"
              value={clusterStats.map((c) => c.ramBytes ?? 0).reduce((a, b) => a + b, 0)}
              valueLabel={formatBytes(
                clusterStats.map((c) => c.ramBytes ?? 0).reduce((a, b) => a + b, 0),
                { minimumFractionDigits: 1, maximumFractionDigits: 1 },
              )}
              max={
                clusterStats.find((s) => typeof s.totalRamBytes == "number" && !!s.totalRamBytes)?.totalRamBytes ?? 1
              }
            />
          </Grid>
          <Grid item xs={6} sm={5} md={3}>
            <Card className={classes.fullHeight}>
              <CardContent className={classes.cardContent}>
                <StorageIcon className={classes.icon} color="primary" />
                <Typography variant="h5" color="textPrimary">
                  {formatNumber(clusterStats.map((c) => c.guilds).reduce((a, b) => a + b, 0))}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  Servers
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={5} md={3}>
            <Card className={classes.fullHeight}>
              <CardContent className={classes.cardContent}>
                <PeopleIcon className={classes.icon} color="primary" />
                <Typography variant="h5" color="textPrimary">
                  {formatNumber(clusterStats.map((c) => c.users).reduce((a, b) => a + b, 0))}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  Users
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12}>
            <Typography variant="h4" align="center" color="primary">
              Clusters
            </Typography>
          </Grid>

          {clusterStats.map((cluster) => (
            <Grid item key={cluster.id}>
              <ClusterCard cluster={cluster} onClick={cluster.error ? onClickClusterError : onClickClusterCard} />
            </Grid>
          ))}
        </Grid>
      </Container>

      {typeof selectedClusterStats != "undefined" && (
        <ClusterStatsDialog
          clusterStats={selectedClusterStats}
          open={!selectedClusterStats.error}
          onClose={onCloseClusterDialog}
        />
      )}
    </DefaultLayout>
  )
}

export default StatsPage
