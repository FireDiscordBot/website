import * as React from "react"
import Paper from "@material-ui/core/Paper"
import Button from "@material-ui/core/Button"
import Avatar from "@material-ui/core/Avatar"
import Typography from "@material-ui/core/Typography"
import Card from "@material-ui/core/Card"
import CardContent from "@material-ui/core/CardContent"
import CardActions from "@material-ui/core/CardActions"
import { createStyles, makeStyles } from "@material-ui/core/styles"
import UserPageLayout from "@/layouts/user-page"
import Loading from "@/components/loading"
import DiscordFlagImage from "@/components/DiscordFlagImage"
import useSession from "@/hooks/use-session"
import { parseFlags } from "@/utils/discord"

const useStyles = makeStyles((theme) =>
  createStyles({
    paper: {
      padding: theme.spacing(2),
      display: "flex",
      marginBottom: theme.spacing(2),
    },
    avatar: {
      width: "80px",
      height: "80px",
    },
    details: {
      margin: theme.spacing("auto", 0, "auto", 2),
      display: "flex",
      flexDirection: "column",
    },
    bold: {
      fontWeight: 700,
    },
    flags: {
      marginTop: theme.spacing(1) / 2,
      "& > span:not(:last-child)": {
        marginRight: theme.spacing(1),
      },
    },
  }),
)

const AccountPage = () => {
  const classes = useStyles()
  const [session, loading] = useSession({ redirectTo: "/" })

  if (!session || loading) {
    return <Loading />
  }

  const flags = parseFlags(session.user.publicFlags, session.user.premiumType)
  const flagsElements = flags.map((flag, index) => <DiscordFlagImage flag={flag} key={index} />)

  return (
    <UserPageLayout>
      <Typography variant="h4" gutterBottom>
        General info
      </Typography>

      <Paper className={classes.paper}>
        <Avatar src={session.user.image} className={classes.avatar} />
        <div className={classes.details}>
          <div>
            <Typography variant="body1" component="span" className={classes.bold}>
              {session.user.name}
            </Typography>
            <Typography variant="body1" color="textSecondary" component="span">
              #{session.user.discriminator}
            </Typography>
          </div>
          <div className={classes.flags}>{flagsElements}</div>
        </div>
      </Paper>

      <Typography variant="h4" gutterBottom>
        Your plan
      </Typography>

      <Card>
        <CardContent>
          <Typography variant="h5">Default</Typography>
        </CardContent>
        <CardActions>
          <Button color="primary">Be premium</Button>
        </CardActions>
      </Card>
    </UserPageLayout>
  )
}

export default AccountPage
