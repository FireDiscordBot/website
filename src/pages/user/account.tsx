import * as React from "react"
import Link from "next/link"
import Box from "@material-ui/core/Box"
import Button from "@material-ui/core/Button"
import Tooltip from "@material-ui/core/Tooltip"
import Avatar from "@material-ui/core/Avatar"
import Typography from "@material-ui/core/Typography"
import Card from "@material-ui/core/Card"
import CardContent from "@material-ui/core/CardContent"
import CardActions from "@material-ui/core/CardActions"
import { createStyles, makeStyles } from "@material-ui/core/styles"
import Skeleton from "@material-ui/lab/Skeleton"
import useSWR from "swr"

import { emitter, handler } from "../_app"

import UserPageLayout from "@/layouts/user-page"
import Loading from "@/components/loading"
import DiscordFlagImage from "@/components/DiscordFlagImage"
import useSession from "@/hooks/use-session"
import useCurrentSubscription from "@/hooks/use-current-subscription"
import { parseFlags } from "@/utils/discord"
import { GetCollectData } from "@/types"

type DataRequestResponse =
  | { success: false; error: string }
  | {
      success: true
      url: string
      data: {
        type: "Buffer"
        data: number[]
      } | null
    }

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
  const setErrorMessage = (text: string) =>
    emitter.emit("NOTIFICATION", {
      text,
      severity: "error",
      horizontal: "right",
      vertical: "top",
      autoHideDuration: 5000,
    })

  const { data: dataRequest, mutate } = useSWR<GetCollectData>(session ? "/api/user/data-archive" : null, {
    revalidateOnReconnect: false,
    revalidateOnFocus: false,
  })
  const [aliases, setAliases] = React.useState<string[]>((handler?.config?.aliases as string[]) ?? [])

  React.useEffect(() => {
    setErrorMessage(error?.message)
  }, [error])

  if (!session || loading) {
    return <Loading />
  }

  const flags = parseFlags(
    handler?.auth?.user.publicFlags ?? session.user.publicFlags,
    handler?.auth?.user.premiumType ?? session.user.premiumType,
  )
  const flagsElements = flags.map((flag, index) => <DiscordFlagImage flag={flag} key={index} />)

  handler?.registerConfigListener("aliases", setAliases as (value: unknown) => void)

  const onClickRequestData = async (event: React.MouseEvent) => {
    event.preventDefault()
    await mutate(undefined, true)

    if (typeof dataRequest?.status == "number" && dataRequest.status != 0) {
      const link = document.createElement("a")
      link.href = dataRequest.url
      link.download = `${handler.session}.zip`
      link.click()
      return link.remove()
    }

    // let json: PostCollectData
    // try {
    //   json = await fetcher<PostCollectData>("/api/user/data-archive", {
    //     method: "POST",
    //   })
    // } catch (e) {
    //   setErrorMessage(createErrorResponse(e).error)
    //   return
    // }

    // openUrl(json.url, true, true)

    const dataResponse = await requestData().catch(() => {
      emitter.emit("NOTIFICATION", {
        text: "Failed to request data",
        severity: "error",
        horizontal: "right",
        vertical: "top",
        autoHideDuration: 5000,
      })
      return null
    })
    if (!dataResponse) return
    if (!dataResponse.success)
      return emitter.emit("NOTIFICATION", {
        text: dataResponse.error,
        severity: "error",
        horizontal: "right",
        vertical: "top",
        autoHideDuration: 5000,
      })
    else {
      const link = document.createElement("a")
      const file = dataResponse.data
        ? new Blob([Buffer.from(dataResponse.data.data)], { type: "application/zip" })
        : null
      link.href = file ? URL.createObjectURL(file) : dataResponse.url
      link.download = `${handler.session}.zip`
      link.click()
      link.remove()
    }
  }

  const requestData = async (): Promise<DataRequestResponse> =>
    new Promise((resolve, reject) => {
      if (!handler) return resolve({ success: false, error: "NO_HANDLER" })
      const nonce = (+new Date()).toString()
      handler.websocket?.handlers.set(nonce, resolve)
      handler.requestData(nonce)

      setTimeout(() => {
        if (handler.websocket?.handlers.has(nonce)) {
          handler.websocket.handlers.delete(nonce)
          reject("Data request timed out")
        }
      }, 10000)
    })

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
        <CardActions className={classes.flex}>
          {aliases.length ? (
            <Box>
              <Typography variant="body1" component="span">
                Aliases (WIP):
              </Typography>
              <br></br>
              <Typography variant="body1" color="textSecondary" component="span">
                {aliases.join(", ")}
              </Typography>
            </Box>
          ) : (
            <Box></Box>
          )}
        </CardActions>
        <CardActions>
          {dataRequest && dataRequest.status != 0 && (
            <Tooltip
              title={
                dataRequest.last_request
                  ? `You've recently requested a copy of your data. You can request again on ${new Date(
                      dataRequest.last_request + 2592000000,
                    ).toDateString()}`
                  : "You've recently requested a copy of your data. You cannot request again at this time."
              }
            >
              <span>
                <Button color="primary" disabled>
                  Request collected data
                </Button>
              </span>
            </Tooltip>
          )}
          {!dataRequest ||
            (dataRequest && dataRequest.status == 0 && (
              <Button color="primary" onClick={onClickRequestData}>
                Request collected data
              </Button>
            ))}
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
    </UserPageLayout>
  )
}

export default AccountPage
