import * as React from "react"
import { NextRouter, useRouter } from "next/router"
import NextLink from "next/link"
import Container from "@material-ui/core/Container"
import Grid from "@material-ui/core/Grid"
import Paper from "@material-ui/core/Paper"
import List from "@material-ui/core/List"
import ListItem, { ListItemProps } from "@material-ui/core/ListItem"
import ListItemText from "@material-ui/core/ListItemText"

import DefaultLayout from "./default"

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

type Props = {
  children: React.ReactNode
}

const UserPageLayout = ({ children }: Props) => {
  const router = useRouter()

  return (
    <DefaultLayout>
      <Container>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={3} md={2}>
            <Paper>
              <List component="nav">
                <ListItemLink href="/user/account" router={router}>
                  <ListItemText primary="Account" />
                </ListItemLink>
                <ListItemLink href="/user/premium" router={router}>
                  <ListItemText primary="Premium" />
                </ListItemLink>
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
