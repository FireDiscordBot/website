import * as React from "react"
import Typography from "@mui/material/Typography"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import CardActionArea from "@mui/material/CardActionArea"

import { ClusterStats } from "@/interfaces/aether"

type Props = {
  cluster: ClusterStats
  onClick: (id: number) => void
}

const ClusterCard = ({ cluster, onClick }: Props) => {
  const onClickCard = () => onClick(cluster.id)

  return (
    <Card>
      <CardActionArea onClick={onClickCard}>
        <CardContent>
          <Typography
            variant="body1"
            color={
              cluster.error || cluster.unavailableGuilds || cluster.shards.some((shard) => shard.status != 0)
                ? "error"
                : "initial"
            }
          >
            {cluster.id}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

export default ClusterCard
