import * as React from "react"
import Typography from "@material-ui/core/Typography"
import Card from "@material-ui/core/Card"
import CardContent from "@material-ui/core/CardContent"
import CardActionArea from "@material-ui/core/CardActionArea"

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
          <Typography variant="body1">{cluster.id}</Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

export default ClusterCard
