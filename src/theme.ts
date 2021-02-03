import { createMuiTheme } from '@material-ui/core/styles'
import { red, grey, orange } from '@material-ui/core/colors'

const theme = createMuiTheme({
  palette: {
    primary: {
      main: red["700"],
    },
    secondary: {
      main: grey["700"],
    },
    error: {
      main: orange.A400,
    },
    background: {
      default: '#fff',
    },
  },
})

export default theme