import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"

import CustomCircularProgress, { Props } from "./CustomCircularProgress"

const CircularProgressCard = (props: Props) => {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent
        sx={{
          "&:last-child": {
            paddingBottom: (theme) => theme.spacing(2),
          },
        }}
      >
        <CustomCircularProgress {...props} />
      </CardContent>
    </Card>
  )
}

export default CircularProgressCard
