import { createTheme } from "@material-ui/core/styles"
import { red, grey } from "@material-ui/core/colors"

const theme = createTheme({
  palette: {
    type: "dark",
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
