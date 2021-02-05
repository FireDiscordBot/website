import * as React from 'react'
import Dialog, { DialogProps } from "@material-ui/core/Dialog"
import DialogContent from "@material-ui/core/DialogContent"
import Typography from "@material-ui/core/Typography"
import Box from "@material-ui/core/Box"
import Card from "@material-ui/core/Card"
import CardContent from "@material-ui/core/CardContent"
import Grid from "@material-ui/core/Grid"
import { createStyles, makeStyles } from '@material-ui/core/styles'
import PeopleIcon from "@material-ui/icons/People"
import StorageIcon from "@material-ui/icons/Storage"
import { ClusterStats } from "../interfaces/aether"
import { formatBytes, formatNumber } from "../utils/formatting"
import CustomCircularProgress from "./CustomCircularProgress"
import DialogTitle from "./DialogTitle"

const useStyles = makeStyles(theme =>
  createStyles({
    cardContent: {
      "&:last-child": {
        paddingBottom: theme.spacing(2),
      },
    },
    // TODO: fix vertical center on mobile
    fullHeight: {
      height: '100%',
    },
    icon: {
      fontSize: theme.spacing(10),
    },
    chartsContainer: {
      marginBottom: theme.spacing(2)
    }
  }),
)

type Props = {
  open?: boolean;
  onClose: DialogProps['onClose'];
  clusterStats: ClusterStats;
}

const ClusterStatsDialog = ({ onClose, clusterStats, ...props }: Props) => {
  const classes = useStyles()
  const open = props.open ?? false

  const onTitleClose = () => onClose && onClose({}, "backdropClick")

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md">
      <DialogTitle onClose={onTitleClose}>
        Cluster {clusterStats.id} ({clusterStats.name})
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} justify="center" className={classes.chartsContainer}>
          <Grid item xs={6} sm={3} md={3}>
            <Card className={classes.fullHeight}>
              <CardContent classes={{ root: classes.cardContent }}>
                <CustomCircularProgress title="CPU" value={clusterStats.cpu}/>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3} md={3}>
            <Card className={classes.fullHeight}>
              <CardContent classes={{ root: classes.cardContent }}>
                <CustomCircularProgress
                  title="RAM"
                  value={0}
                  valueLabel={formatBytes(clusterStats.ramBytes, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                  max={clusterStats.ramBytes}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3} md={3}>
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
                    {formatNumber(clusterStats.guilds)}
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    Guilds
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3} md={3}>
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
                    {formatNumber(clusterStats.users)}
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    Users
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        { /* TODO: better styling im lazy uh */ }

        <Grid container>
          <Grid item xs={12} md={6}>
            <Typography variant="body1">
              Uptime: {clusterStats.uptime}
            </Typography>
            <Typography variant="body1">
              Unavailable Guilds: {formatNumber(clusterStats.unavailableGuilds)}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body1">
              Version: {clusterStats.version} ({clusterStats.versions})
            </Typography>
            <Typography variant="body1">
              Commands: {clusterStats.commands}
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  )
}

export default ClusterStatsDialog
