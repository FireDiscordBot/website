import { loadStripe } from "@stripe/stripe-js"
import * as React from "react"
import useSWR, { mutate } from "swr"
import Grid from "@material-ui/core/Grid"
import Box from "@material-ui/core/Box"
import Typography from "@material-ui/core/Typography"
import { TextField } from "@material-ui/core"
import { Pagination } from "@material-ui/lab"

import { emitter } from "../_app"

import { openUrl } from "@/utils/open-url"
import { discord, stripe as stripeConstants } from "@/constants"
import fetcher, { createErrorResponse } from "@/utils/fetcher"
import { PostSubscriptionResponse } from "@/types"
import { Plan } from "@/interfaces/fire"
import SelectPlanCard from "@/components/SelectPlanCard"
import UserPage from "@/layouts/user-page"
import Loading from "@/components/loading"
import UserGuildCard from "@/components/UserGuildCard"
import SubscriptionCard from "@/components/SubscriptionCard"
import useCurrentSubscription from "@/hooks/use-current-subscription"
import useSession from "@/hooks/use-session"
import { UserGuild } from "@/interfaces/aether"

if (!stripeConstants.publicKey) {
  throw Error("Env variable NEXT_PUBLIC_STRIPE_API_PUBLIC_KEY not defined")
}

const stripePromise = loadStripe(stripeConstants.publicKey)

// stolen from https://stackoverflow.com/a/57697857 lol
const paginate = function (array: UserGuild[], index: number, size: number) {
  // transform values
  index = Math.abs(index)
  index = index > 0 ? index - 1 : index
  size = size < 1 ? 1 : size

  // filter
  return [
    ...array.filter((_, n) => {
      return n >= index * size && n < (index + 1) * size
    }),
  ]
}

const getSort = (guild: UserGuild) => guild.name.toLowerCase().charCodeAt(0)
const sort = (guilds: UserGuild[]) => guilds.sort((a, b) => getSort(a) - getSort(b))

const PremiumPage = () => {
  const [session, loading] = useSession({ redirectTo: "/" })
  const { subscription, isLoading: isLoadingSubscription, error: subscriptionError } = useCurrentSubscription(
    session != null && !loading,
  )
  const setErrorMessage = (text: string | null) =>
    text &&
    emitter.emit("NOTIFICATION", {
      text,
      severity: "error",
      horizontal: "right",
      vertical: "top",
      autoHideDuration: 5000,
    })

  const { data: initialGuilds, isValidating, mutate: mutateGuilds, error: guildsError } = useSWR<UserGuild[]>(
    session ? "/api/user/guilds" : null,
    {
      revalidateOnReconnect: false,
      revalidateOnFocus: false,
    },
  )
  const premiumGuildsCount = React.useMemo(() => initialGuilds?.filter((guild) => guild.premium)?.length ?? 0, [
    initialGuilds,
  ])
  const [guilds, setGuilds] = React.useState(sort(initialGuilds || []))

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

  React.useEffect(() => {
    if (!guilds) setGuilds(sort(initialGuilds || []))
  }, [guilds, initialGuilds])

  const [page, setPage] = React.useState(1)

  const handleChangePage = (_: unknown, page: number) => {
    setPage(page)
  }

  if (!session || loading) {
    return <Loading />
  }

  const handleTextChange = (value: string | null | undefined) => {
    if (!value) return setGuilds(sort(initialGuilds || []))

    const filteredGuilds =
      initialGuilds?.filter((guild) => guild.name.toLowerCase().includes(value.toLowerCase())) || []
    if (page > Math.ceil(filteredGuilds.length / 12)) setPage(Math.ceil(filteredGuilds.length / 12))
    setGuilds(sort(filteredGuilds))
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
      const errorResponse = createErrorResponse(e)
      if (errorResponse.code == 404) {
        openUrl(discord.inviteUrl(guild.id), true)
      } else {
        setErrorMessage(errorResponse.error)
      }
      return
    }

    // update guilds state
    const newGuilds = guilds ? [...guilds] : []
    const guildIndex = newGuilds.findIndex((newGuild) => newGuild.id == guild.id)
    if (guildIndex !== -1) {
      const guild = newGuilds[guildIndex]
      newGuilds[guildIndex] = { ...guild, premium: premiumGuilds.includes(guild.id) }
    }
    setGuilds(newGuilds)

    // update initial guilds list (not filtered)
    const newInitialGuilds = initialGuilds ? [...initialGuilds] : []
    const initialGuildIndex = newInitialGuilds.findIndex((newGuild) => newGuild.id == guild.id)
    if (initialGuildIndex !== -1) {
      const guild = newInitialGuilds[initialGuildIndex]
      newInitialGuilds[initialGuildIndex] = { ...guild, premium: premiumGuilds.includes(guild.id) }
    }

    mutateGuilds(newInitialGuilds, false)
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
        Servers
      </Typography>

      <Box mb={2}>
        <TextField
          id="guild-filter"
          onChange={(value) => handleTextChange(value.target.value)}
          fullWidth
          placeholder={"Find a server..."}
        />
      </Box>

      <Grid container spacing={2}>
        {isValidating &&
          [...Array(8)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <UserGuildCard onClickToggle={onClickToggle} />
            </Grid>
          ))}
        {!isValidating &&
          paginate(guilds || [], page, 12).map((guild, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <UserGuildCard guild={guild} onClickToggle={onClickToggle} />
            </Grid>
          ))}
      </Grid>

      {guilds.length > 12 && (
        <Pagination
          style={{ marginTop: 15, display: "flex", alignItems: "center", justifyContent: "center" }}
          count={Math.ceil(guilds.length / 12)}
          onChange={handleChangePage}
          variant="outlined"
        />
      )}

      <SelectPlanCard
        open={plansDialogOpen}
        onClose={onClosePlansDialog}
        onClickPlan={onClickPlan}
        loadPlans={!subscription && !isLoadingSubscription}
      />
    </UserPage>
  )
}

export default PremiumPage
