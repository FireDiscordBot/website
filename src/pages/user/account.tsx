import DiscordFlagImage from "@/components/DiscordFlagImage"
import Loading from "@/components/loading"
import SelectPlanCard from "@/components/SelectPlanCard"
import { stripe as stripeConstants } from "@/constants"
import useCurrentSubscription from "@/hooks/use-current-subscription"
import useSession from "@/hooks/use-session"
import { Plan } from "@/interfaces/fire"
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
import useSWR, { mutate } from "swr"
import { emitter, handler } from "../_app"

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
  const [session, loading] = useSession({ redirectTo: "/" })
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

  const [plansDialogOpen, setPlansDialogOpen] = React.useState(false)

  React.useEffect(() => {
    if (!subscription && !isLoadingSubscription) {
      mutate("/api/stripe/subscriptions", fetcher("/api/stripe/subscriptions"))
    }
  }, [subscription, isLoadingSubscription])

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

  const onClickPlan = async (plan: Plan) => {
    const stripe = await stripePromise

    if (!stripe) {
      setErrorMessage("Stripe not loaded. Try again in 10 seconds.")
      return
    }

    let json: PostSubscriptionResponse

    try {
      json = await fetcher(`/api/user/subscription?servers=${plan.servers}`, {
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

  const onClickSelectPlan = () => setPlansDialogOpen(true)

  const onClosePlansDialog = () => setPlansDialogOpen(false)

  return (
    <UserPageLayout title="Account" noindex nofollow>
      {!subscription && premiumPromotion?.text && (premiumPromotion?.expires ?? Number.MAX_VALUE) > +new Date() && (
        <Box width={"100%"}>
          <Alert severity="info">{premiumPromotion.text}</Alert>
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
            {isLoadingSubscription ? <Skeleton /> : subscription ? subscription.name : ""}
          </Typography>

          {!isLoadingSubscription && !subscription && (
            <Typography variant="body1" color="textSecondary" component="span">
              Premium gives you access to a bunch of extra features to make Fire the best all-in-one bot you&#39;ve ever
              seen.
              <br />
              <br />
              Get persisted roles, invite tracking, custom short links, and more!
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
            <Button color="primary" onClick={onClickSelectPlan}>
              Get Premium Now
            </Button>
            <Link href="https://inv.wtf/premium" passHref>
              <Button color="secondary">Learn More</Button>
            </Link>
          </CardActions>
        )}
      </Card>

      <SelectPlanCard
        open={plansDialogOpen}
        onClose={onClosePlansDialog}
        onClickPlan={onClickPlan}
        loadPlans={!subscription && !isLoadingSubscription}
      />
    </UserPageLayout>
  )
}

export default AccountPage
