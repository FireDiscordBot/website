import StorageIcon from "@mui/icons-material/Storage"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Container from "@mui/material/Container"
import Grid from "@mui/material/Grid"
import Typography from "@mui/material/Typography"
import { styled } from "@mui/material/styles"
import { Handler } from "mitt"
import { useRouter } from "next/router"
import { useCallback, useEffect, useState } from "react"

import DefaultLayout from "@/components/layout/default"
import CircularProgressCard from "@/components/ui/CircularProgressCard"
import ClusterCard from "@/components/ui/ClusterCard"
import ClusterStatsDialog from "@/components/ui/ClusterStatsDialog"
import useAether from "@/hooks/use-aether"
import useAppSnackbar from "@/hooks/use-snackbar-control"
import { ClusterStats, InitialStats } from "@/interfaces/aether"
import { formatBytes, formatNumber } from "@/utils/formatting"

const StyledStorageIcon = styled(StorageIcon)(({ theme }) => ({
  fontSize: theme.spacing(10),
}))

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

const StatsPage = () => {
  const router = useRouter()
  const aether = useAether()
  const { showSnackbar } = useAppSnackbar()

  const [clusterStats, setClusterStats] = useState<ClusterStats[]>([])
  const [selectedClusterStats, setSelectedClusterStats] = useState<ClusterStats | undefined>(undefined)

  const findClusterStats = useCallback(
    (id: number) => {
      return clusterStats.find((cluster) => cluster.id === id)
    },
    [clusterStats],
  )

  const selectClusterStats = useCallback(
    (id: number | undefined, updateQuery = true) => {
      if (typeof id !== "undefined") {
        setSelectedClusterStats(findClusterStats(id))
        updateQuery && router.push(`/stats`, `/stats?cluster=${id}`, { shallow: true })
      } else {
        setSelectedClusterStats(undefined)
        updateQuery && router.push("/stats", undefined, { shallow: true })
      }
    },
    [setSelectedClusterStats, findClusterStats, router],
  )

  const onClickClusterError = (id: number) => {
    showSnackbar(`Cluster ${id} is currently unavailable`, 5000, "error")
  }
  const onCloseClusterDialog = () => selectClusterStats(undefined)

  useEffect(() => {
    if (!aether) {
      return
    }

    const handleNewInitialClusterStats: Handler<InitialStats> = (_initialStats) => {
      if (clusterStats.length === 0) {
        // TODO: create empty cluster stats
      }
    }

    const handleNewClusterStats: Handler<ClusterStats> = (clusterStat) => {
      const newClusterStats = [...clusterStats]

      const index = newClusterStats.findIndex((cluster) => cluster.id === clusterStat.id)
      if (index == -1) {
        newClusterStats.push(clusterStat)
      } else {
        newClusterStats[index] = clusterStat
      }

      setClusterStats(newClusterStats)
    }

    aether.events.on("newInitialClusterStats", handleNewInitialClusterStats)
    aether.events.on("newClusterStats", handleNewClusterStats)

    return () => {
      aether.events.off("newInitialClusterStats", handleNewInitialClusterStats)
      aether.events.off("newClusterStats", handleNewClusterStats)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aether])

  useEffect(() => {
    if (typeof router.query.cluster === "string") {
      const clusterId = parseInt(router.query.cluster, 10)
      selectClusterStats(clusterId, false)
    }
  }, [router.query, selectClusterStats])

  return (
    <DefaultLayout title="Stats">
      <Container>
        <Grid container spacing={4} justifyContent="center" mb={2}>
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
            <StyledCard>
              <StyledCardContent>
                <StyledStorageIcon color="primary" />
                <Typography variant="h5" color="textPrimary">
                  {formatNumber(clusterStats.map((c) => c.guilds).reduce((a, b) => a + b, 0))}
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
                <StyledStorageIcon color="primary" />
                <Typography variant="h5" color="textPrimary">
                  {formatNumber(clusterStats.map((c) => c.users).reduce((a, b) => a + b, 0))}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  Users
                </Typography>
              </StyledCardContent>
            </StyledCard>
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
              <ClusterCard cluster={cluster} onClick={cluster.error ? onClickClusterError : selectClusterStats} />
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
