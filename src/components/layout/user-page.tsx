import { AccountCircle, Code, Event, Star } from "@mui/icons-material"
import { ListItemIcon } from "@mui/material"
import Container from "@mui/material/Container"
import Grid from "@mui/material/Grid"
import List from "@mui/material/List"
import ListItem, { ListItemProps } from "@mui/material/ListItem"
import ListItemText from "@mui/material/ListItemText"
import Paper from "@mui/material/Paper"
import { NextSeoProps } from "next-seo"
import NextLink from "next/link"
import { NextRouter, useRouter } from "next/router"

import DefaultLayout from "./default"

import { handler } from "@/pages/_app"

const ListItemLink = ({
  router,
  href,
  ...restProps
}: ListItemProps<"a", { button?: true }> & { router: NextRouter }) => {
  const selected = router.route === href
  return (
    <NextLink href={href ?? ""} passHref>
      <ListItem button component="a" selected={selected} {...restProps} />
    </NextLink>
  )
}

type Props = NextSeoProps & {
  children: React.ReactNode
}

const UserPageLayout = ({ children, ...restProps }: Props) => {
  const router = useRouter()

  return (
    <DefaultLayout {...restProps}>
      <Container>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={3} md={2}>
            <Paper>
              <List component="nav">
                <ListItemLink href="/user/account" router={router}>
                  <ListItemIcon>
                    <AccountCircle />
                  </ListItemIcon>
                  <ListItemText primary="Account" />
                </ListItemLink>
                <ListItemLink href="/user/premium" router={router}>
                  <ListItemIcon>
                    <Star />
                  </ListItemIcon>
                  <ListItemText primary="Premium" />
                </ListItemLink>
                <ListItemLink href="/user/reminders" router={router}>
                  <ListItemIcon>
                    <Event />
                  </ListItemIcon>
                  <ListItemText primary="Reminders" />
                </ListItemLink>
                {(handler?.isSuperuser() || handler?.router?.route == "/user/admin") && (
                  <ListItemLink href="/user/admin" router={router}>
                    <ListItemIcon>
                      <Code />
                    </ListItemIcon>
                    <ListItemText primary="Admin" />
                  </ListItemLink>
                )}
              </List>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={9} md={10}>
            {children}
          </Grid>
        </Grid>
      </Container>
    </DefaultLayout>
  )
}

export default UserPageLayout
