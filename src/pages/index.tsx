import * as React from "react"
import Image from "next/image"
import Container from "@mui/material/Container"
import Grid from "@mui/material/Grid"
import Typography from "@mui/material/Typography"
import Button from "@mui/material/Button"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import { styled } from "@mui/material/styles"
import GitHubIcon from "@mui/icons-material/GitHub"

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

const StyledButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(0, 1),
}))

const IndexPage = () => {
  return (
    <DefaultLayout>
      <Container>
        <Grid
          container
          justifyContent="center"
          sx={(theme) => ({
            paddingTop: theme.spacing(4),
            paddingBottom: theme.spacing(4),
            [theme.breakpoints.up("sm")]: {
              paddingTop: theme.spacing(12),
              paddingBottom: theme.spacing(8),
            },
          })}
        >
          <Grid item xs={3} md={2} mb={3}>
            <Image src="/logo-gr.svg" width={256} height={256} layout="responsive" alt="Fire's logo" />
          </Grid>
          <Grid item xs={12} container justifyContent="center">
            <Grid item xs={12} sm={7} md={5}>
              <Typography variant="h5" component="h2" align="center">
                A Discord bot for all your needs. With memes, utilities, moderation and more. Fire is the only bot you
                will need.
              </Typography>
            </Grid>
            <Grid item xs={12} mt={3} display="flex" justifyContent="center">
              <StyledButton variant="contained" color="primary" href={discord.inviteUrl()}>
                Invite
              </StyledButton>
              <StyledButton variant="outlined" startIcon={<GitHubIcon />} href={fire.githubUrl}>
                GitHub
              </StyledButton>
            </Grid>
          </Grid>
        </Grid>
        <Grid container spacing={4} justifyContent="center">
          {FEATURES.map((feature, index) => (
            <Grid item md={4} key={index}>
              <Card sx={{ height: "100%" }}>
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
