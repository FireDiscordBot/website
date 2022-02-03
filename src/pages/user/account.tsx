import Avatar from "@mui/material/Avatar"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Card from "@mui/material/Card"
import CardActions from "@mui/material/CardActions"
import CardContent from "@mui/material/CardContent"
import Skeleton from "@mui/material/Skeleton"
import Tooltip from "@mui/material/Tooltip"
import Typography from "@mui/material/Typography"
import { Handler } from "mitt"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

import UserPageLayout from "@/components/layout/user-page"
import DiscordFlagImage from "@/components/ui/DiscordFlagImage"
import Loading from "@/components/ui/Loading"
import useAether from "@/hooks/use-aether"
import useCurrentSubscription from "@/hooks/use-current-subscription"
import useSession from "@/hooks/use-session"
import { DataArchiveRequestResponse, LastDataArchive } from "@/lib/aether/types"
import { ApiResponse } from "@/lib/api/response"
import { getAvatarImageUrl, parseFlags } from "@/lib/discord"
import fetcher from "@/utils/fetcher"
import { openUrl } from "@/utils/open-url"

const AccountPage = () => {
  const [session, loading] = useSession({ redirectTo: "/" })
  const aether = useAether()
  const { subscription, isLoading, error } = useCurrentSubscription(session != null && !loading)

  const [lastDataArchive, setLastDataArchive] = useState<LastDataArchive | undefined>(undefined)
  const [loadingDataArchive, setLoadingDataArchive] = useState(false)
  const avatarImageUrl = useMemo(
    () => (session ? getAvatarImageUrl(session.user.avatar, session.user.id, session.user.discriminator) : ""),
    [session],
  )

  const setErrorMessage = (_text: string) => {
    // emitter.emit("NOTIFICATION", {
    //   text,
    //   severity: "error",
    //   horizontal: "right",
    //   vertical: "top",
    //   autoHideDuration: 5000,
    // })
  }

  useEffect(() => {
    let active = true

    async function checkLastDataArchive() {
      active && setLoadingDataArchive(true)

      const lastDataArchive = await fetcher<ApiResponse<LastDataArchive>>("/api/user/dataArchive")

      if (active) {
        setLoadingDataArchive(false)
        setLastDataArchive(lastDataArchive.success ? lastDataArchive.data : undefined)
      }
    }

    checkLastDataArchive()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!aether) {
      return
    }

    const handleDataArchiveResponse: Handler<DataArchiveRequestResponse> = (response) => {
      if (response.success) {
        let url: string

        if (response.data !== null) {
          url = URL.createObjectURL(new Blob([Buffer.from(response.data.data)], { type: "application/zip" }))
        } else {
          url = response.url
        }

        openUrl(url, false, `${aether?.aetherSession}.zip`)
      } else {
        // TODO: display error
      }

      setLoadingDataArchive(false)
    }

    aether.events.on("dataArchiveRequestResponse", handleDataArchiveResponse)

    return () => {
      aether.events.off("dataArchiveRequestResponse", handleDataArchiveResponse)
    }
  }, [aether])

  useEffect(() => {
    setErrorMessage(error?.message)
  }, [error])

  if (!session || loading) {
    return <Loading />
  }

  const flags = parseFlags(session.user.publicFlags, session.user.premiumType)
  const flagsElements = flags.map((flag, index) => <DiscordFlagImage flag={flag} key={index} />)

  const onClickRequestData = async (event: React.MouseEvent) => {
    event.preventDefault()

    // TODO: don't disable button if there is available data for download
    if (lastDataArchive && lastDataArchive.status !== 0) {
      openUrl(lastDataArchive.url, false, `${aether?.aetherSession}.zip`)
      return
    }

    setLoadingDataArchive(true)

    aether?.requestDataArchive()
    // TODO: 10 seconds timeout
  }

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
          {lastDataArchive && lastDataArchive.status !== 0 && (
            <Tooltip
              title={
                lastDataArchive.last_request
                  ? `You've recently requested a copy of your data. You can request again on ${new Date(
                      lastDataArchive.last_request + 2592000000,
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
          {(!lastDataArchive || lastDataArchive.status === 0) && (
            <Button color="primary" disabled={loadingDataArchive} onClick={onClickRequestData}>
              Request collected data
            </Button>
          )}
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
