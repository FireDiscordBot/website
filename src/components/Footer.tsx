import * as React from 'react'
import Container from "@material-ui/core/Container"
import Typography from "@material-ui/core/Typography"
import { createStyles, makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme =>
  createStyles({
    footer: {
      padding: theme.spacing(2, 0),
      marginTop: 'auto',
      backgroundColor: theme.palette.grey[900],
    },
    container: {
      display: 'flex',
      justifyContent: 'center'
    }
  }),
)

const Footer = () => {
  const classes = useStyles()

  return (
    <footer className={classes.footer}>
      <Container className={classes.container}>
        <Typography variant="caption" color="textSecondary">
          © 2021 Fire Bot. All Rights Reserved.
        </Typography>
      </Container>
    </footer>
  )
}

export default Footer
