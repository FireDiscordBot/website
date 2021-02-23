import * as React from "react"
import Box from "@material-ui/core/Box"
import { createStyles, makeStyles } from "@material-ui/core/styles"

import NavBar from "@/components/NavBar"
import Footer from "@/components/Footer"

const useStyles = makeStyles((theme) =>
  createStyles({
    main: {
      paddingBottom: theme.spacing(4),
    },
  }),
)

type Props = {
  children?: React.ReactNode
}

const DefaultLayout = ({ children }: Props) => {
  const classes = useStyles()

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      <NavBar />
      <main className={classes.main}>{children}</main>
      <Footer />
    </Box>
  )
}

export default DefaultLayout
