import * as React from 'react'
import Box from '@material-ui/core/Box'
import { createStyles, makeStyles } from "@material-ui/core/styles"
import NavBar from "./NavBar"
import Footer from "./Footer"

const useStyles = makeStyles(theme =>
  createStyles({
    main: {
      paddingBottom: theme.spacing(4),
    },
  }),
)

type Props = {
  children?: React.ReactNode
}

const Layout = ({ children }: Props) => {
  const classes = useStyles()

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      <NavBar/>
      <main className={classes.main}>
        {children}
      </main>
      <Footer/>
    </Box>
  )
}

export default Layout
