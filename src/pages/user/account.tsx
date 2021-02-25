import * as React from "react"
import Link from "next/link"
import Box from "@material-ui/core/Box"
import Button from "@material-ui/core/Button"
import Avatar from "@material-ui/core/Avatar"
import Typography from "@material-ui/core/Typography"
import Card from "@material-ui/core/Card"
import CardContent from "@material-ui/core/CardContent"
import CardActions from "@material-ui/core/CardActions"
import { createStyles, makeStyles } from "@material-ui/core/styles"
import Skeleton from "@material-ui/lab/Skeleton"

import { openUrl } from "@/utils/open-url"
import fetcher, { createErrorResponse } from "@/utils/fetcher"
import { PostCollectData } from "@/types"
import SimpleSnackbar from "@/components/SimpleSnackbar"
import UserPageLayout from "@/layouts/user-page"
import Loading from "@/components/loading"
import DiscordFlagImage from "@/components/DiscordFlagImage"
import useSession from "@/hooks/use-session"
import useCurrentSubscription from "@/hooks/use-current-subscription"
import { parseFlags } from "@/utils/discord"

const useStyles = makeStyles((theme) =>
  createStyles({
    mb: {
      marginBottom: theme.spacing(2),
    },
    flex: {
      display: "flex",
    },
    avatar: {
      width: "80px",
      height: "80px",
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
  const { subscription, isLoading, error } = useCurrentSubscription(session != null && !loading)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  React.useEffect(() => {
    setErrorMessage(error?.message)
  }, [error])

  if (!session || loading) {
    return <Loading />
  }

  const flags = parseFlags(session.user.publicFlags, session.user.premiumType)
  const flagsElements = flags.map((flag, index) => <DiscordFlagImage flag={flag} key={index} />)

  const onClickRequestData = async (event: React.MouseEvent) => {
    event.preventDefault()

    let json: PostCollectData
    try {
      json = await fetcher<PostCollectData>("/api/user/collect-data", {
        method: "POST",
      })
    } catch (e) {
      setErrorMessage(createErrorResponse(e).error)
      return
    }

    openUrl(json.url, true, true)
  }

  return (
    <UserPageLayout title="Account" noindex nofollow>
      <Typography variant="h4" gutterBottom>
        General info
      </Typography>

      <Card className={classes.mb}>
        <CardContent className={classes.flex}>
          <Avatar src={session.user.image} className={classes.avatar} />
          <Box display="flex" flexDirection="column" mr={0} ml={2} mt="auto" mb="auto">
            <div>
              <Typography variant="body1" component="span" className={classes.bold}>
                {session.user.name}
              </Typography>
              <Typography variant="body1" color="textSecondary" component="span">
                #{session.user.discriminator}
              </Typography>
            </div>
            <div className={classes.flags}>{flagsElements}</div>
          </Box>
        </CardContent>
        <CardActions>
          <Button color="primary" onClick={onClickRequestData}>
            Request collected data
          </Button>
        </CardActions>
      </Card>

      <Typography variant="h4" gutterBottom>
        Your plan
      </Typography>

      <Card>
        <CardContent>
          <Typography variant="h5">
            {isLoading ? <Skeleton /> : subscription ? subscription.name : "Default"}
          </Typography>
        </CardContent>
        <CardActions>
          <Link href="/user/premium" passHref>
            <Button color="primary">Fire premium page</Button>
          </Link>
        </CardActions>
      </Card>

      <SimpleSnackbar
        message={errorMessage}
        severity="error"
        horizontal="right"
        vertical="top"
        autoHideDuration={5000}
      />
    </UserPageLayout>
  )
}

export default AccountPage
