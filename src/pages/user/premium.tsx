import { loadStripe } from "@stripe/stripe-js"
import * as React from "react"
import useSWR, { mutate } from "swr"
import Grid from "@material-ui/core/Grid"
import Box from "@material-ui/core/Box"
import Typography from "@material-ui/core/Typography"
import LinearProgress from "@material-ui/core/LinearProgress"

import fetcher, { createErrorResponse } from "@/utils/fetcher"
import { PostSubscriptionResponse } from "@/types"
import SimpleSnackbar from "@/components/SimpleSnackbar"
import { Plan } from "@/interfaces/fire"
import SelectPlanCard from "@/components/SelectPlanCard"
import UserPage from "@/layouts/user-page"
import Loading from "@/components/loading"
import UserGuildCard from "@/components/UserGuildCard"
import SubscriptionCard from "@/components/SubscriptionCard"
import useCurrentSubscription from "@/hooks/use-current-subscription"
import useSession from "@/hooks/use-session"
import { UserGuild } from "@/interfaces/aether"

if (!process.env.NEXT_PUBLIC_STRIPE_API_PUBLIC_KEY) {
  throw Error("Env variable NEXT_PUBLIC_STRIPE_API_PUBLIC_KEY not defined")
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_API_PUBLIC_KEY)

const PremiumPage = () => {
  const [session, loading] = useSession({ redirectTo: "/" })
  const { subscription, isLoading: isLoadingSubscription, error: subscriptionError } = useCurrentSubscription(
    session != null && !loading,
  )
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  const { data: guilds, isValidating, mutate: mutateGuilds, error: guildsError } = useSWR<UserGuild[]>(
    session ? "/api/user/guilds" : null,
    {
      revalidateOnReconnect: false,
      revalidateOnFocus: false,
    },
  )
  const premiumGuildsCount = React.useMemo(() => guilds?.filter((guild) => guild.premium)?.length ?? 0, [guilds])
  const [plansDialogOpen, setPlansDialogOpen] = React.useState(false)

  React.useEffect(() => {
    if (!subscription && !isLoadingSubscription) {
      mutate("/api/stripe/subscriptions", fetcher("/api/stripe/subscriptions"))
    }
  }, [subscription, isLoadingSubscription])

  React.useEffect(() => {
    const message = subscriptionError?.message ?? guildsError?.message
    setErrorMessage(message)
  }, [subscriptionError, guildsError])

  if (!session || loading) {
    return <Loading />
  }

  const onClickToggle = async (guild: UserGuild) => {
    if (!subscription) {
      setErrorMessage("No subscription")
      return
    }

    if (!guild.premium && premiumGuildsCount >= subscription.servers) {
      setErrorMessage("Server limit reached")
      return
    }

    let premiumGuilds: string[]

    try {
      premiumGuilds = await fetcher(`/api/user/guilds/${guild.id}/premium`, {
        method: "PUT",
      })
    } catch (e) {
      setErrorMessage(createErrorResponse(e).error)
      return
    }

    const newGuilds = guilds ? [...guilds] : []
    const guildIndex = newGuilds.findIndex((newGuild) => newGuild.id == guild.id)
    if (guildIndex !== -1) {
      const guild = newGuilds[guildIndex]
      newGuilds[guildIndex] = { ...guild, premium: premiumGuilds.includes(guild.id) }
    }

    return mutateGuilds(newGuilds, false)
  }

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
    } catch (e) {
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

  const onCloseErrorSnackbar = () => setErrorMessage(null)

  return (
    <UserPage title="Premium" noindex nofollow>
      <Typography variant="h4" gutterBottom>
        Your plan
      </Typography>

      <Box mb={2}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <SubscriptionCard onClickSelectPlan={onClickSelectPlan} />
          </Grid>
        </Grid>
      </Box>

      <Typography variant="h4" gutterBottom>
        Guilds
      </Typography>

      <Grid container spacing={2}>
        {isValidating && (
          <Grid item xs={12}>
            <LinearProgress variant="query" />
          </Grid>
        )}
        {!isValidating &&
          guilds?.map((guild, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <UserGuildCard guild={guild} onClickToggle={onClickToggle} />
            </Grid>
          ))}
      </Grid>

      <SelectPlanCard
        open={plansDialogOpen}
        onClose={onClosePlansDialog}
        onClickPlan={onClickPlan}
        loadPlans={!subscription && !isLoadingSubscription}
      />

      <SimpleSnackbar
        message={errorMessage}
        severity="error"
        horizontal="right"
        vertical="top"
        autoHideDuration={3000}
        onClose={onCloseErrorSnackbar}
      />
    </UserPage>
  )
}

export default PremiumPage
