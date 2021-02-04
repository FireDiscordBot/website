import * as React from "react"
import Image from 'next/image'
import { useSession } from 'next-auth/client'
import Container from "@material-ui/core/Container"
import Grid from "@material-ui/core/Grid"
import Typography from "@material-ui/core/Typography"
import { createStyles, makeStyles } from '@material-ui/core/styles'
import Layout from '../src/components/Layout'

const useStyles = makeStyles(theme =>
  createStyles({
    banner: {
      paddingTop: theme.spacing(4),
      paddingBottom: theme.spacing(4),
      [theme.breakpoints.up('sm')]: {
        paddingTop: theme.spacing(16),
        paddingBottom: theme.spacing(16),
      },
    },
  }),
)

const Index = () => {
  const classes = useStyles()
  const [session] = useSession()
  console.log(session)

  return (
    <Layout>
      <Container className={classes.banner}>
        <Grid container alignItems="center" justify="space-evenly">
          <Grid item xs={2} sm={3} md={4}>
            <Image src="/logo-gr.svg" width={256} height={256} layout="responsive" alt="Fire's logo"/>
          </Grid>
          <Grid item xs={12} sm={5} md={4}>
            <Typography variant="h5" align="justify">
              A Discord bot for all your needs. With memes, utilities, moderation and more. Fire is the only bot you
              will need.
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </Layout>
  )
}

export default Index
