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
import CustomCircularProgress from "../src/components/CustomCircularProgress"
import Layout from "../src/components/Layout"
import { fire } from "../src/constants"
import { FireStats } from "../src/interfaces/aether"
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
  }),
)

type Props = {
  initialFireStats: FireStats;
}

const StatsPage = ({ initialFireStats }: Props) => {
  const classes = useStyles()
  const [fireStats, setFireStats] = React.useState<FireStats>(initialFireStats)

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

  return (
    <Layout>
      <Container>
        <Grid container spacing={4} justify="center">
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
                  valueLabel={formatBytes(fireStats.ramBytes, { maximumFractionDigits: 1 })}
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
      </Container>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  let initialFireStats: FireStats

  try {
    const response = await fetch(`${fire.aetherApiUrl}/stats`, {
      mode: 'cors',
      headers: !process.browser ? { "User-Agent": "Fire Website" } : undefined,
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
    },
  }
}

export default StatsPage
