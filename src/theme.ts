import { red, grey } from "@mui/material/colors"
import { createTheme } from "@mui/material/styles"

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: red["700"],
    },
    secondary: {
      main: grey["700"],
    },
    error: {
      main: red["400"],
    },
  },
})

export default theme
