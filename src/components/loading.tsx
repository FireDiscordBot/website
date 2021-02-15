import * as React from "react"
import Box from "@material-ui/core/Box"
import CircularProgress from "@material-ui/core/CircularProgress"

const Loading = () => (
  <Box display="flex" alignItems="center" justifyContent="center" height="100vh">
    <CircularProgress variant="indeterminate" style={{ width: "50px", height: "50px" }} />
  </Box>
)

export default Loading
