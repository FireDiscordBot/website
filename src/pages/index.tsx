import * as React from "react"
import Image from "next/image"
import Container from "@material-ui/core/Container"
import Grid from "@material-ui/core/Grid"
import Typography from "@material-ui/core/Typography"
import Button from "@material-ui/core/Button"
import Card from "@material-ui/core/Card"
import CardContent from "@material-ui/core/CardContent"
import { createStyles, makeStyles } from "@material-ui/core/styles"
import GitHubIcon from "@material-ui/icons/GitHub"

import DefaultLayout from "@/layouts/default"
import { discord, fire } from "@/constants"

type Feature = {
  title: string
  text: string
}

const FEATURES: Feature[] = [
  {
    title: "Integrations",
    text: `
    Fire has a few integrations that allow you to retrieve content from external platforms 
    such as Reddit and even the Google Assistant.
    `.trimStart(),
  },
  {
    title: "Utilities",
    text: `
    Fire has many different utilities to help you get information quickly about many things.
    An example is auto-quotes when you send a message link.
    `.trimStart(),
  },
  {
    title: "Moderation",
    text: `
    We know how hard moderation can be, so we try to make things easy. With commands to mute, 
    block (per-channel mute), kick and ban, moderation is a piece of cake!
    `.trimStart(),
  },
]

const useStyles = makeStyles((theme) =>
  createStyles({
    banner: {
      paddingTop: theme.spacing(4),
      paddingBottom: theme.spacing(4),
      [theme.breakpoints.up("sm")]: {
        paddingTop: theme.spacing(12),
        paddingBottom: theme.spacing(8),
      },
    },
    logoGridItem: {
      marginBottom: theme.spacing(3),
    },
    buttonsGridItem: {
      marginTop: theme.spacing(3),
      display: "flex",
      justifyContent: "center",
    },
    button: {
      margin: theme.spacing(0, 1),
    },
    featureCard: {
      height: "100%",
    },
  }),
)

const IndexPage = () => {
  const classes = useStyles()

  return (
    <DefaultLayout>
      <Container>
        <Grid container justifyContent="center" className={classes.banner}>
          <Grid item xs={3} md={2} className={classes.logoGridItem}>
            <Image src="/logo-gr.svg" width={256} height={256} layout="responsive" alt="Fire's logo" />
          </Grid>
          <Grid item xs={12} container justifyContent="center">
            <Grid item xs={12} sm={7} md={5}>
              <Typography variant="h5" component="h2" align="center">
                A Discord bot for all your needs. With memes, utilities, moderation and more. Fire is the only bot you
                will need.
              </Typography>
            </Grid>
            <Grid item xs={12} className={classes.buttonsGridItem}>
              <Button variant="contained" color="primary" className={classes.button} href={discord.inviteUrl()}>
                Invite
              </Button>
              <Button
                variant="outlined"
                color="default"
                className={classes.button}
                startIcon={<GitHubIcon />}
                href={fire.githubUrl}
              >
                GitHub
              </Button>
            </Grid>
          </Grid>
        </Grid>
        <Grid container spacing={4} justifyContent="center">
          {FEATURES.map((feature, index) => (
            <Grid item md={4} key={index}>
              <Card className={classes.featureCard}>
                <CardContent>
                  <Typography variant="h4" color="textSecondary" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" component="p">
                    {feature.text}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </DefaultLayout>
  )
}

export default IndexPage
