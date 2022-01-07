import AppBar, { AppBarProps } from "@mui/material/AppBar"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Container from "@mui/material/Container"
import Link from "@mui/material/Link"
import Toolbar from "@mui/material/Toolbar"
import Typography from "@mui/material/Typography"
import { styled } from "@mui/material/styles"
import useScrollTrigger from "@mui/material/useScrollTrigger"
import { signIn, signOut } from "next-auth/react"
import NextImage from "next/image"
import NextLink from "next/link"
import { useRouter } from "next/router"
import { useState } from "react"

import AvatarButton from "@/components/ui/AvatarButton"
import UserAvatarMenu from "@/components/ui/UserAvatarMenu"
import useSession from "@/hooks/use-session"

interface StyledAppBarProps extends AppBarProps {
  scrolled: boolean
}

const StyledAppBar = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== "scrolled",
})<StyledAppBarProps>(({ theme, scrolled }) => ({
  backgroundColor: "transparent",
  transition: theme.transitions.create(["background-color", "box-shadow"]),
  ...(scrolled && {
    backgroundColor: theme.palette.background.default,
  }),
}))

const NavBar = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const scrollTrigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  })
  const router = useRouter()
  const [session, loading] = useSession()

  let homePageLink: React.ReactNode
  if (router.route == "/") {
    homePageLink = (
      <Link variant="h6" color="inherit" underline="hover">
        Fire
      </Link>
    )
  } else {
    homePageLink = (
      <Link>
        <NextImage src="/logo-gr.svg" width={40} height={40} layout="intrinsic" priority />
      </Link>
    )
  }

  let authButton: React.ReactNode

  if (loading) {
    authButton = <Typography variant="body2">Loading...</Typography>
  } else if (session) {
    if (session.error == "RefreshFailed") {
      signIn("discord")
    }

    const onClickAvatar = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      setAnchorEl(e.currentTarget)
    }
    const onClickLogout = (e: React.MouseEvent) => {
      e.preventDefault()
      return signOut()
    }
    const onCloseMenu = () => setAnchorEl(null)

    authButton = (
      <>
        <AvatarButton disableRipple user={session.user} onClick={onClickAvatar} />
        <UserAvatarMenu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={onCloseMenu}
          onClickLogout={onClickLogout}
        />
      </>
    )
  } else {
    const onClick = (e: React.MouseEvent) => {
      e.preventDefault()
      return signIn("discord")
    }

    authButton = (
      <Button color="inherit" onClick={onClick}>
        Login with Discord
      </Button>
    )
  }

  return (
    <>
      <StyledAppBar position="fixed" scrolled={scrollTrigger} elevation={scrollTrigger ? 4 : 0}>
        <Container>
          <Toolbar disableGutters>
            <NextLink href="/" passHref>
              {homePageLink}
            </NextLink>
            <Box sx={{ flexGrow: 1 }} />
            <Box
              sx={(theme) => ({
                margin: theme.spacing(0, 2),
                "& a:not(:last-child)": {
                  marginRight: theme.spacing(1),
                },
              })}
            >
              <NextLink href="/discover" passHref>
                <Button variant="text">Discover</Button>
              </NextLink>
              <NextLink href="/commands" passHref>
                <Button variant="text">Commands</Button>
              </NextLink>
              <NextLink href="/stats" passHref>
                <Button variant="text">Stats</Button>
              </NextLink>
            </Box>
            {authButton}
          </Toolbar>
        </Container>
      </StyledAppBar>
      <Box minHeight={64} />
    </>
  )
}

export default NavBar
