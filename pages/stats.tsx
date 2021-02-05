import { GetServerSideProps } from "next"
import * as React from 'react'
import Container from "@material-ui/core/Container"
import Grid from "@material-ui/core/Grid"
import Card from "@material-ui/core/Card"
import CardContent from "@material-ui/core/CardContent"
import Box from "@material-ui/core/Box"
import Typography from "@material-ui/core/Typography"
import { createStyles, makeStyles } from '@material-ui/core/styles'
import PeopleIcon from '@material-ui/icons/People'
import StorageIcon from '@material-ui/icons/Storage'
import ClusterStatsDialog from "../src/components/ClusterStatsDialog"
import CustomCircularProgress from "../src/components/CustomCircularProgress"
import Layout from "../src/components/Layout"
import { fire } from "../src/constants"
import { ClusterStats, FireStats } from "../src/interfaces/aether"
import { formatBytes, formatNumber } from "../src/utils/formatting"

const useStyles = makeStyles(theme =>
  createStyles({
    cardContent: {
      "&:last-child": {
        paddingBottom: theme.spacing(2),
      },
    },
    fullHeight: {
      height: '100%',
    },
    icon: {
      fontSize: theme.spacing(10),
    },
    chartsContainer: {
      marginBottom: theme.spacing(2),
    },
    clusterGridItem: {
      display: 'flex',
    },
  }),
)

type Props = {
  initialFireStats: FireStats;
  initialSelectedClusterId: number | null;
}

const StatsPage = ({ initialFireStats, initialSelectedClusterId }: Props) => {
  const classes = useStyles()
  const [fireStats, setFireStats] = React.useState<FireStats>(initialFireStats)
  const [selectedClusterId, setSelectedClusterId] = React.useState<number | null>(initialSelectedClusterId);

  const onCloseDialog = () => setSelectedClusterId(null)

  React.useEffect(() => {
    const ws = new WebSocket(fire.realtimeStatsUrl)
    ws.onmessage = message => {
      try {
        setFireStats(JSON.parse(message.data))
      } catch (e) {
        console.error("Error trying to parse response from real time stats socket.", e)
      }
    }

    return () => ws.close()
  }, [])

  let selectedClusterStats: ClusterStats | undefined
  if (Number.isInteger(selectedClusterId)) {
    selectedClusterStats = fireStats.clusters.find(cluster => cluster.id == selectedClusterId)
    console.log('found stats', selectedClusterStats)
  }

  return (
    <Layout>
      <Container>
        <Grid container spacing={4} justify="center" className={classes.chartsContainer}>
          <Grid item xs={6} sm={5} md={3}>
            <Card>
              <CardContent classes={{ root: classes.cardContent }}>
                <CustomCircularProgress title="CPU" value={fireStats.cpu}/>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={5} md={3}>
            <Card>
              <CardContent classes={{ root: classes.cardContent }}>
                <CustomCircularProgress
                  title="RAM"
                  value={fireStats.ramBytes}
                  valueLabel={formatBytes(fireStats.ramBytes, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                  max={fireStats.totalRamBytes}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={5} md={3}>
            <Card className={classes.fullHeight}>
              <CardContent className={classes.fullHeight}>
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  flexDirection="column"
                  className={classes.fullHeight}
                >
                  <StorageIcon className={classes.icon} color="primary"/>
                  <Typography variant="h5" color="textPrimary">
                    {formatNumber(fireStats.guilds)}
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    Guilds
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={5} md={3}>
            <Card className={classes.fullHeight}>
              <CardContent className={classes.fullHeight}>
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  flexDirection="column"
                  className={classes.fullHeight}
                >
                  <PeopleIcon className={classes.icon} color="primary"/>
                  <Typography variant="h5" color="textPrimary">
                    {formatNumber(fireStats.users)}
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    Users
                  </Typography>
                </Box>
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

          {fireStats.clusters.map(cluster => (
            <Grid item className={classes.clusterGridItem} key={cluster.id}>
              <Card onClick={() => {
                setSelectedClusterId(cluster.id)
              }}> { /* TODO */}
                <CardContent className={classes.cardContent}>
                  <Typography variant="body1">
                    {cluster.id}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {selectedClusterStats && <ClusterStatsDialog
        clusterStats={selectedClusterStats!!}
        open={true}
        onClose={onCloseDialog}
      />}
    </Layout>
  )
}

type QueryParams = {
  cluster: string;
}

export const getServerSideProps: GetServerSideProps<Props, QueryParams> = async (context) => {
  const initialSelectedClusterId = typeof context.query?.cluster != 'undefined'
    ? parseInt(context.query.cluster as string, 10) : null
  let initialFireStats: FireStats

  try {
    const response = await fetch(`${fire.aetherApiUrl}/stats`, {
      mode: 'cors',
      headers: { "User-Agent": "Fire Website" },
    })
    initialFireStats = await response.json()
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
      initialSelectedClusterId
    },
  }
}

export default StatsPage
