import Box from "@mui/material/Box"
import CircularProgress, { CircularProgressProps } from "@mui/material/CircularProgress"
import Typography from "@mui/material/Typography"

import { formatNumber } from "@/utils/formatting"

export type Props = CircularProgressProps & {
  title: string
  value: number
  valueLabel?: string
  min?: number
  max?: number
}

const CustomCircularProgress = (props: Props) => {
  const min = props.min ?? 0
  const max = props.max ?? 100
  const percentage = ((props.value - min) * 100) / (max - min)
  const formattedPercentage = formatNumber(percentage, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })

  return (
    <Box position="relative">
      <CircularProgress variant="determinate" value={100} color="secondary" size="100%" sx={{ display: "block" }} />
      <CircularProgress
        variant="determinate"
        value={percentage}
        size="100%"
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          display: "block",
        }}
      />
      <Box
        top={0}
        left={0}
        bottom={0}
        right={0}
        position="absolute"
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
      >
        <Typography variant="h6" component="div" color="textSecondary">
          {props.title}
        </Typography>
        <Typography variant="body1" component="div" color="textPrimary">
          {formattedPercentage} %
        </Typography>
        {props.valueLabel && (
          <Typography variant="body1" component="div" color="textPrimary">
            {props.valueLabel}
          </Typography>
        )}
      </Box>
    </Box>
  )
}

export default CustomCircularProgress
