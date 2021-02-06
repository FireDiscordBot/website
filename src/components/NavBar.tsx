import clsx from "clsx"
import * as React from 'react'
import NextLink from 'next/link'
import { signIn, signOut, useSession } from 'next-auth/client'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import Container from '@material-ui/core/Container'
import Link from "@material-ui/core/Link"
import useScrollTrigger from '@material-ui/core/useScrollTrigger'
import { createStyles, makeStyles } from '@material-ui/core/styles'
import AvatarButton from './AvatarButton'
import UserAvatarMenu from "./UserAvatarMenu"

const useStyles = makeStyles(theme =>
  createStyles({
    root: {
      backgroundColor: 'transparent',
      transition: theme.transitions.create(["background-color", "box-shadow"]),
    },
    scrolled: {
      backgroundColor: theme.palette.background.default,
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    grow: {
      flexGrow: 1,
    },
    buttons: {
      margin: theme.spacing(0, 2),
      '& button:not(:last-child)': {
        marginRight: theme.spacing(1),
      },
    },
    emptyToolbar: theme.mixins.toolbar,
  }),
)

const NavBar = () => {
  const classes = useStyles()
  const scrollTrigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  })
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null)
  const [session, loading] = useSession()

  let authButton: React.ReactNode

  if (loading) {
    authButton = <Typography variant="body2">Loading...</Typography>
  } else if (session) {
    const onClickAvatar = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      setAnchorEl(e.currentTarget)
    }
    const onClickLogout = (e: React.MouseEvent) => {
      e.preventDefault()
      return signOut()
    }
    const onCloseMenu = () => setAnchorEl(null)

    authButton = <>
      <AvatarButton disableRipple user={session.user} onClick={onClickAvatar}/>
      <UserAvatarMenu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={onCloseMenu} onClickLogout={onClickLogout}/>
    </>
  } else {
    const onClick = (e: React.MouseEvent) => {
      e.preventDefault()
      return signIn('discord')
    }
    authButton = <Button color="inherit" onClick={onClick}>Login with Discord</Button>
  }

  return (
    <>
      <AppBar position="fixed" className={clsx(
        classes.root,
        { [classes.scrolled]: scrollTrigger },
      )} elevation={scrollTrigger ? 4 : 0}>
        <Container>
          <Toolbar disableGutters>
            <NextLink href="/" passHref>
              <Link variant="h6" color="inherit">
                Fire
              </Link>
            </NextLink>
            <div className={classes.grow}/>
            <div className={classes.buttons}>
              <NextLink href="/stats" passHref>
                <Button variant="text">
                  Stats
                </Button>
              </NextLink>
            </div>
            {authButton}
          </Toolbar>
        </Container>
      </AppBar>
      <div className={classes.emptyToolbar}/>
    </>
  )
}

export default NavBar
