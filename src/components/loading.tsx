import * as React from "react"
import Box from "@mui/material/Box"
import CircularProgress from "@mui/material/CircularProgress"

const Loading = () => (
  <Box display="flex" alignItems="center" justifyContent="center" height="100vh">
    <CircularProgress variant="indeterminate" style={{ width: "50px", height: "50px" }} />
  </Box>
)

export default Loading
