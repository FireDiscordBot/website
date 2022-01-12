import PeopleIcon from "@mui/icons-material/People"
import Box from "@mui/material/Box"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Dialog from "@mui/material/Dialog"
import DialogContent from "@mui/material/DialogContent"
import Grid from "@mui/material/Grid"
import Typography from "@mui/material/Typography"
import { styled } from "@mui/material/styles"

import CircularProgressCard from "./CircularProgressCard"
import DialogTitle from "./DialogTitle"

import type { ClusterStats } from "@/interfaces/aether"
// import { handler } from "@/pages/_app"
import { formatBytes, formatNumber } from "@/utils/formatting"

interface StatLineProps {
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

const StyledCard = styled(Card)({
  height: "100%",
})

const StyledCardContent = styled(CardContent)({
  display: "flex",
  alignItems: "center",
  flexDirection: "column",
  justifyContent: "center",
  height: "inherit",
})

const StyledPeopleIcon = styled(PeopleIcon)(({ theme }) => ({
  fontSize: theme.spacing(10),
}))

interface ClusterStatsDialogProps {
  open?: boolean
  onClose: () => void
  clusterStats: ClusterStats
}

const ClusterStatsDialog = ({ onClose, clusterStats, ...props }: ClusterStatsDialogProps) => {
  const open = props.open ?? false

  // TODO
  // const restartCluster = () => {
  // if (!handler) return
  // handler.restartCluster({
  //   id: clusterStats.id,
  //   reason: `Restart requested by ${handler.user?.username}#${handler.user?.discriminator}`,
  // })
  // }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md">
      <DialogTitle onClose={onClose}>
        Cluster {clusterStats.id} ({clusterStats.name})
      </DialogTitle>
      {/* {handler?.isSuperuser() && (
        <Button size="small" onClick={restartCluster}>
          Restart
        </Button>
      )} */}
      <DialogContent
        dividers
        sx={{
          backgroundColor: (theme) => theme.palette.background.default,
          borderBottom: "none",
        }}
      >
        <Grid container spacing={2} justifyContent="center" sx={{ marginBottom: (theme) => theme.spacing(2) }}>
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
            <StyledCard>
              <StyledCardContent>
                <StyledPeopleIcon color="primary" />
                <Typography variant="h5" color="textPrimary">
                  {formatNumber(clusterStats.guilds)}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  Servers
                </Typography>
              </StyledCardContent>
            </StyledCard>
          </Grid>
          <Grid item xs={6} sm={5} md={3}>
            <StyledCard>
              <StyledCardContent>
                <StyledPeopleIcon color="primary" />
                <Typography variant="h5" color="textPrimary">
                  {formatNumber(clusterStats.users)}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  Users
                </Typography>
              </StyledCardContent>
            </StyledCard>
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
            <StatLine title="Unavailable Servers" value={formatNumber(clusterStats.unavailableGuilds)} />
          </Grid>
        </Grid>

        {/* TODO: add shards */}
      </DialogContent>
    </Dialog>
  )
}

export default ClusterStatsDialog
