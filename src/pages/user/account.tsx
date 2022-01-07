import Avatar from "@mui/material/Avatar"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Card from "@mui/material/Card"
import CardActions from "@mui/material/CardActions"
import CardContent from "@mui/material/CardContent"
import Skeleton from "@mui/material/Skeleton"
import Tooltip from "@mui/material/Tooltip"
import Typography from "@mui/material/Typography"
import Link from "next/link"
import { useEffect, useMemo } from "react"
import useSWR from "swr"

import { emitter, handler } from "../_app"

import UserPageLayout from "@/components/layout/user-page"
import DiscordFlagImage from "@/components/ui/DiscordFlagImage"
import Loading from "@/components/ui/Loading"
import useCurrentSubscription from "@/hooks/use-current-subscription"
import useSession from "@/hooks/use-session"
import { getAvatarImageUrl, parseFlags } from "@/lib/discord"
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

const AccountPage = () => {
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

  // TODO: fix
  const { data: dataRequest, mutate } = useSWR<GetCollectData>(session ? "/api/user/data-archive" : null, {
    revalidateOnReconnect: false,
    revalidateOnFocus: false,
  })

  const avatarImageUrl = useMemo(
    () => (session ? getAvatarImageUrl(session.user.avatar, session.user.id, session.user.discriminator) : ""),
    [session],
  )

  useEffect(() => {
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

  const onClickRequestData = async (event: React.MouseEvent) => {
    event.preventDefault()
    // TODO
    const reqDataEl = document.getElementById("request-data")
    if (reqDataEl) {
      reqDataEl.className += " Mui-disabled"
    }
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
      <Card sx={{ marginBottom: (theme) => theme.spacing(2) }}>
        <CardContent sx={{ display: "flex" }}>
          <Avatar src={avatarImageUrl} sx={{ width: "80px", height: "80px" }} />
          <Box display="flex" flexDirection="column" mr={0} ml={2} mt="auto" mb="auto">
            <div>
              <Typography variant="body1" component="span" fontWeight={700}>
                {session.user.username}
              </Typography>
              <Typography variant="body1" color="textSecondary" component="span">
                #{session.user.discriminator}
              </Typography>
            </div>
            <Box
              sx={(theme) => ({
                marginTop: theme.spacing(0.5),
                "& > span:not(:last-child)": {
                  marginRight: theme.spacing(1),
                },
              })}
            >
              {flagsElements}
            </Box>
          </Box>
        </CardContent>
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
              <Button id="request-data" color="primary" onClick={onClickRequestData}>
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
