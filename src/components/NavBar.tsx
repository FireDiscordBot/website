import * as React from 'react'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import IconButton from '@material-ui/core/IconButton'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import MenuIcon from '@material-ui/icons/Menu'
import {createStyles, makeStyles} from '@material-ui/core/styles'
import {signIn, signOut, useSession} from 'next-auth/client'

const useStyles = makeStyles(theme =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
    },
  }),
)

const NavBar = () => {
  const classes = useStyles()
  const [session, loading] = useSession()

  let authButton: React.ReactNode

  if (loading) {
    authButton = <Typography variant="body2">Loading...</Typography>
  } else if (session) {
    const onClick = (e: React.MouseEvent) => {
      e.preventDefault()
      return signOut()
    }
    authButton = <Button color="inherit" onClick={onClick}>Logout</Button>
  } else {
    const onClick = (e: React.MouseEvent) => {
      e.preventDefault()
      return signIn('discord')
    }
    authButton = <Button color="inherit" onClick={onClick}>Login with Discord</Button>
  }

  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
          <MenuIcon/>
        </IconButton>
        <Typography variant="h6" className={classes.title}>
          Fire
        </Typography>
        {authButton}
      </Toolbar>
    </AppBar>
  )
}

export default NavBar