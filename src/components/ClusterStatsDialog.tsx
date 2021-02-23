import * as React from "react"
import Dialog from "@material-ui/core/Dialog"
import DialogContent from "@material-ui/core/DialogContent"
import Typography from "@material-ui/core/Typography"
import Box from "@material-ui/core/Box"
import Card from "@material-ui/core/Card"
import CardContent from "@material-ui/core/CardContent"
import Grid from "@material-ui/core/Grid"
import { createStyles, makeStyles } from "@material-ui/core/styles"
import PeopleIcon from "@material-ui/icons/People"
import StorageIcon from "@material-ui/icons/Storage"

import DialogTitle from "./DialogTitle"
import CircularProgressCard from "./CircularProgressCard"

import { ClusterStats } from "@/interfaces/aether"
import { formatBytes, formatNumber } from "@/utils/formatting"

type StatLineProps = {
  title: string
  value: string
}

const StatLine = ({ title, value }: StatLineProps) => (
  <Box display="flex">
    <Typography variant="body1" color="textSecondary">
      {title}:&nbsp;
    </Typography>
    <Typography variant="body1">{value}</Typography>
  </Box>
)

const useStyles = makeStyles((theme) =>
  createStyles({
    cardContent: {
      display: "flex",
      alignItems: "center",
      flexDirection: "column",
      justifyContent: "center",
      height: "inherit",
    },
    dialogCardContent: {
      backgroundColor: theme.palette.background.default,
      borderBottom: "none",
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
  }),
)

type Props = {
  open?: boolean
  onClose: () => void
  clusterStats: ClusterStats
}

const ClusterStatsDialog = ({ onClose, clusterStats, ...props }: Props) => {
  const classes = useStyles()
  const open = props.open ?? false

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md">
      <DialogTitle onClose={onClose}>
        Cluster {clusterStats.id} ({clusterStats.name})
      </DialogTitle>
      <DialogContent dividers className={classes.dialogCardContent}>
        <Grid container spacing={2} justify="center" className={classes.chartsContainer}>
          <Grid item xs={6} sm={5} md={3}>
            <CircularProgressCard title="CPU" value={clusterStats.cpu} />
          </Grid>
          <Grid item xs={6} sm={5} md={3}>
            <CircularProgressCard
              title="RAM"
              value={0}
              valueLabel={formatBytes(clusterStats.ramBytes, {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              })}
              max={clusterStats.ramBytes}
            />
          </Grid>
          <Grid item xs={6} sm={5} md={3}>
            <Card className={classes.fullHeight}>
              <CardContent className={classes.cardContent}>
                <StorageIcon className={classes.icon} color="primary" />
                <Typography variant="h5" color="textPrimary">
                  {formatNumber(clusterStats.guilds)}
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
                  {formatNumber(clusterStats.users)}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  Users
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container>
          <Grid item xs={12} sm={6}>
            <StatLine title="Environment" value={clusterStats.env.toUpperCase()} />
            <StatLine title="Version" value={`${clusterStats.version} (${clusterStats.versions})`} />
            <StatLine title="Uptime" value={clusterStats.uptime} />
            <StatLine title="Ping" value={formatNumber(clusterStats.restPing)} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <StatLine title="Commands" value={formatNumber(clusterStats.commands)} />
            <StatLine title="Unavailable Guilds" value={formatNumber(clusterStats.unavailableGuilds)} />
            <StatLine title="Events" value={formatNumber(clusterStats.events)} />
          </Grid>
        </Grid>

        {/* TODO: add shards */}
      </DialogContent>
    </Dialog>
  )
}

export default ClusterStatsDialog
