import { useRouter } from "next/router"
import * as React from "react"
import { GetStaticProps } from "next"
import Container from "@material-ui/core/Container"
import Grid from "@material-ui/core/Grid"
import Card from "@material-ui/core/Card"
import CardContent from "@material-ui/core/CardContent"
import Typography from "@material-ui/core/Typography"
import { createStyles, makeStyles } from "@material-ui/core/styles"
import PeopleIcon from "@material-ui/icons/People"
import StorageIcon from "@material-ui/icons/Storage"

import fetcher from "@/utils/fetcher"
import ClusterStatsDialog from "@/components/ClusterStatsDialog"
import Default from "@/layouts/default"
import { fire } from "@/constants"
import { ClusterStats, FireStats } from "@/interfaces/aether"
import { formatBytes, formatNumber } from "@/utils/formatting"
import ClusterCard from "@/components/ClusterCard"
import CircularProgressCard from "@/components/CircularProgressCard"
import useWebsocket from "@/hooks/use-websocket"

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

type Props = {
  initialFireStats: FireStats
}

const StatsPage = ({ initialFireStats }: Props) => {
  const classes = useStyles()
  const router = useRouter()

  const [lastWsMessage] = useWebsocket(fire.realtimeStatsUrl)
  const [fireStats, setFireStats] = React.useState<FireStats>(initialFireStats)
  const [selectedClusterStats, setSelectedClusterStats] = React.useState<ClusterStats | undefined>(undefined)

  const findClusterStats = React.useCallback(
    (id: number) => {
      return fireStats.clusters.find((cluster) => cluster.id === id)
    },
    [fireStats.clusters],
  )
  const onClickClusterCard = (id: number) => setSelectedClusterStats(findClusterStats(id))
  const onCloseClusterDialog = () => setSelectedClusterStats(undefined)

  React.useEffect(() => {
    if (lastWsMessage != null) {
      try {
        setFireStats(JSON.parse(lastWsMessage.data))
      } catch (e) {
        console.error("Error trying to parse response from real time stats socket.", e)
      }
    }
  }, [lastWsMessage])

  React.useEffect(() => {
    if (typeof router.query.cluster === "string") {
      const clusterId = parseInt(router.query.cluster, 10)
      setSelectedClusterStats(findClusterStats(clusterId))
    }
  }, [findClusterStats, router.query])

  React.useEffect(() => {
    if (selectedClusterStats) {
      setSelectedClusterStats(findClusterStats(selectedClusterStats.id))
    }
  }, [findClusterStats, fireStats, selectedClusterStats])

  return (
    <Default>
      <Container>
        <Grid container spacing={4} justify="center" className={classes.chartsContainer}>
          <Grid item xs={6} sm={5} md={3}>
            <CircularProgressCard title="CPU" value={fireStats.cpu} />
          </Grid>
          <Grid item xs={6} sm={5} md={3}>
            <CircularProgressCard
              title="RAM"
              value={fireStats.ramBytes}
              valueLabel={formatBytes(fireStats.ramBytes, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
              max={fireStats.totalRamBytes}
            />
          </Grid>
          <Grid item xs={6} sm={5} md={3}>
            <Card className={classes.fullHeight}>
              <CardContent className={classes.cardContent}>
                <StorageIcon className={classes.icon} color="primary" />
                <Typography variant="h5" color="textPrimary">
                  {formatNumber(fireStats.guilds)}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  Guilds
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={5} md={3}>
            <Card className={classes.fullHeight}>
              <CardContent className={classes.cardContent}>
                <PeopleIcon className={classes.icon} color="primary" />
                <Typography variant="h5" color="textPrimary">
                  {formatNumber(fireStats.users)}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  Users
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <Grid container spacing={2} justify="center">
          <Grid item xs={12}>
            <Typography variant="h4" align="center" color="primary">
              Clusters
            </Typography>
          </Grid>

          {fireStats.clusters.map((cluster) => (
            <Grid item key={cluster.id}>
              <ClusterCard cluster={cluster} onClick={onClickClusterCard} />
            </Grid>
          ))}
        </Grid>
      </Container>

      {typeof selectedClusterStats != "undefined" && (
        <ClusterStatsDialog clusterStats={selectedClusterStats} open={true} onClose={onCloseClusterDialog} />
      )}
    </Default>
  )
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  let initialFireStats: FireStats

  try {
    initialFireStats = await fetcher(`${fire.aetherApiUrl}/stats`, {
      mode: "cors",
      headers: { "User-Agent": "Fire Website" },
    })
  } catch (e) {
    initialFireStats = {
      cpu: 0,
      ramBytes: 0,
      totalRamBytes: 0,
      clusterCount: 0,
      shardCount: 0,
      guilds: 0,
      users: 0,
      events: 0,
      clusters: [],
    }
  }

  return {
    props: {
      initialFireStats,
    },
    revalidate: 120,
  }
}

export default StatsPage
