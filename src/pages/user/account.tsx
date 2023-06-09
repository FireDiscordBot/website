import DiscordFlagImage from "@/components/DiscordFlagImage"
import Loading from "@/components/loading"
import { stripe as stripeConstants } from "@/constants"
import useCurrentSubscription from "@/hooks/use-current-subscription"
import useSession from "@/hooks/use-session"
import { DiscordGuild } from "@/interfaces/discord"
import UserPageLayout from "@/layouts/user-page"
import { GetCollectData, PostSubscriptionResponse, PromotionMessage } from "@/types"
import { parseFlags } from "@/utils/discord"
import fetcher, { createErrorResponse } from "@/utils/fetcher"
import Alert from "@mui/material/Alert"
import Avatar from "@mui/material/Avatar"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Card from "@mui/material/Card"
import CardActions from "@mui/material/CardActions"
import CardContent from "@mui/material/CardContent"
import Skeleton from "@mui/material/Skeleton"
import Tooltip from "@mui/material/Tooltip"
import Typography from "@mui/material/Typography"
import { loadStripe } from "@stripe/stripe-js"
import Link from "next/link"
import * as React from "react"
import useSWR from "swr"
import { emitter, handler } from "../_app"

type PremiumGuildWithoutPremiumProperties = DiscordGuild & { premium?: undefined; managed?: undefined }

if (!stripeConstants.publicKey) {
  throw Error("Env variable NEXT_PUBLIC_STRIPE_API_PUBLIC_KEY not defined")
}

const stripePromise = loadStripe(stripeConstants.publicKey)

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
  const [session, loading] = useSession({ redirectTo: "login" })
  const {
    subscription,
    isLoading: isLoadingSubscription,
    error: subscriptionError,
  } = useCurrentSubscription(session != null && !loading)
  const setErrorMessage = (text: string | null) =>
    text &&
    emitter.emit("NOTIFICATION", {
      text,
      severity: "error",
      horizontal: "right",
      vertical: "top",
      autoHideDuration: 5000,
    })

  const { data: dataRequest, mutate: mutateArchive } = useSWR<GetCollectData>(
    session ? "/api/user/data-archive" : null,
    {
      revalidateOnReconnect: false,
      revalidateOnFocus: false,
    },
  )

  const { data: premiumPromotion } = useSWR<PromotionMessage>(session ? "/api/premium-promotion" : null, {
    revalidateOnReconnect: false,
    revalidateOnFocus: false,
  })

  React.useEffect(() => {
    setErrorMessage(subscriptionError?.message)
  }, [subscriptionError?.message])

  React.useEffect(() => {
    setErrorMessage(subscriptionError?.message)
  }, [subscriptionError])

  if (!session || loading) {
    return <Loading />
  }

  const flags = parseFlags(
    handler?.auth?.user.publicFlags ?? session.user.publicFlags,
    handler?.auth?.user.premiumType ?? session.user.premiumType,
  )
  const flagsElements = flags.map((flag, index) => <DiscordFlagImage flag={flag} key={index} />)

  const onClickSaveServers = async (event: React.MouseEvent) => {
    event.preventDefault()
    if (!handler?.session)
      return emitter.emit("NOTIFICATION", {
        text: "No Aether session, unable to request servers",
        severity: "error",
        horizontal: "right",
        vertical: "top",
        autoHideDuration: 5000,
      })
    const guilds = (await fetcher(`/api/user/guilds?sessionId=${handler.session}`, {
      method: "GET",
    }).catch(() => null)) as PremiumGuildWithoutPremiumProperties[]
    if (!guilds?.length)
      return emitter.emit("NOTIFICATION", {
        text: "Failed to fetch servers list",
        severity: "error",
        horizontal: "right",
        vertical: "top",
        autoHideDuration: 5000,
      })
    const serverList = guilds.map((guild) => {
      // we set these to undefined so they're not included when we save the server list
      guild.premium = undefined
      guild.managed = undefined
      return guild
    })
    const link = document.createElement("a")
    const file = new Blob([Buffer.from(JSON.stringify(serverList, null, 4))], { type: "application/json" })
    link.href = URL.createObjectURL(file)
    link.download = `servers-${handler.session}.json`
    link.click()
    link.remove()
  }

  const onClickRequestData = async (event: React.MouseEvent) => {
    event.preventDefault()
    if (document?.getElementById("request-data")?.className)
      document.getElementById("request-data")!.className += " Mui-disabled"
    await mutateArchive(undefined, true)

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

  const onClickSubscribe = async () => {
    const stripe = await stripePromise

    if (!stripe) {
      setErrorMessage("Stripe not loaded. Try again in 10 seconds.")
      return
    }

    let json: PostSubscriptionResponse

    try {
      json = await fetcher(`/api/user/subscription`, {
        method: "POST",
      })
    } catch (e: any) {
      setErrorMessage(createErrorResponse(e).error)
      return
    }

    const stripeResponse = await stripe.redirectToCheckout({
      sessionId: json.sessionId,
    })

    if (stripeResponse.error) {
      setErrorMessage(stripeResponse.error?.message ?? null)
    }
  }

  return (
    <UserPageLayout title="Account" noindex nofollow>
      {!isLoadingSubscription &&
        !subscription &&
        premiumPromotion?.text &&
        (premiumPromotion?.expires ?? Number.MAX_VALUE) > +new Date() && (
          <Box width={"100%"}>
            <Alert severity="info" variant="outlined">
              {premiumPromotion.text}
            </Alert>
            <br></br>
          </Box>
        )}
      <Typography variant="h4" gutterBottom>
        General info
      </Typography>
      <Card sx={{ marginBottom: (theme) => theme.spacing(2) }}>
        <CardContent sx={{ display: "flex" }}>
          <Avatar src={session.user.image} sx={{ width: "80px", height: "80px" }} />
          <Box display="flex" flexDirection="column" mr={0} ml={2} mt="auto" mb="auto">
            <div>
              <Typography variant="body1" component="span" fontWeight={700}>
                {session.user.name}
              </Typography>
              {session.user.discriminator != "0" ? (
                <Typography variant="body1" color="textSecondary" component="span">
                  #{session.user.discriminator}
                </Typography>
              ) : (
                ""
              )}
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
          <Tooltip title={"Downloads your server list as a machine readable JSON file"}>
            <span>
              <Button color="primary" onClick={onClickSaveServers}>
                Save server list
              </Button>
            </span>
          </Tooltip>
        </CardActions>
      </Card>

      <Typography variant="h4" gutterBottom>
        Your subscription
      </Typography>

      <Card>
        <CardContent>
          <Typography variant="h5">
            {isLoadingSubscription ? <Skeleton /> : subscription ? subscription.name : ""}
          </Typography>

          {!isLoadingSubscription && !subscription && (
            <Typography variant="body1" color="textSecondary" component="span">
              Get more from the bot you love with Premium!
              <br></br>
              Exclusive commands, custom redirects, improvements to features and more!
            </Typography>
          )}
        </CardContent>
        {!!subscription ? (
          <CardActions>
            <Link href="/user/premium" passHref>
              <Button color="primary">Manage Subscription</Button>
            </Link>
          </CardActions>
        ) : (
          <CardActions>
            <Button color="primary" onClick={onClickSubscribe}>
              Get Premium Now
            </Button>
            <Link href="https://inv.wtf/premium" passHref>
              <Button color="secondary">Learn More</Button>
            </Link>
          </CardActions>
        )}
      </Card>
    </UserPageLayout>
  )
}

export default AccountPage
