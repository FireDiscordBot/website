import { Alert, Pagination, TextField } from "@mui/material"
import Box from "@mui/material/Box"
import Grid from "@mui/material/Grid"
import Typography from "@mui/material/Typography"
import { loadStripe } from "@stripe/stripe-js"
import * as React from "react"
import useSWR from "swr"

import { emitter, handler } from "../_app"

import Loading from "@/components/loading"
import ServerLimitCard from "@/components/ServerLimitCard"
import SubscriptionCard from "@/components/SubscriptionCard"
import TrialWarningCard from "@/components/TrialWarningCard"
import UserGuildCard from "@/components/UserGuildCard"
import { discord, stripe as stripeConstants } from "@/constants"
import useCurrentSubscription from "@/hooks/use-current-subscription"
import useSession from "@/hooks/use-session"
import { PremiumDiscordGuild } from "@/interfaces/discord"
import UserPage from "@/layouts/user-page"
import { PostBillingPortalResponse, PostSubscriptionResponse } from "@/types"
import fetcher, { createErrorResponse } from "@/utils/fetcher"
import { openUrl } from "@/utils/open-url"

if (!stripeConstants.publicKey) {
  throw Error("Env variable NEXT_PUBLIC_STRIPE_API_PUBLIC_KEY not defined")
}

const stripePromise = loadStripe(stripeConstants.publicKey)

// stolen from https://stackoverflow.com/a/57697857 lol
const paginate = function (array: PremiumDiscordGuild[], index: number, size: number) {
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

const getSort = (guild: PremiumDiscordGuild) => guild.name.toLowerCase().charCodeAt(0)
const sort = (guilds?: PremiumDiscordGuild[]) =>
  guilds?.length ? guilds.sort((a, b) => getSort(a) - getSort(b)) : undefined

const PremiumPage = () => {
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

  const {
    data: initialGuilds,
    isValidating,
    mutate: mutateGuilds,
    error: guildsError,
  } = useSWR<PremiumDiscordGuild[]>(
    session ? (handler?.session ? `/api/user/guilds?sessionId=${handler.session}` : null) : null,
    {
      revalidateOnReconnect: false,
      revalidateOnFocus: false,
    },
  )
  const premiumGuildsCount = React.useMemo(
    () => initialGuilds?.filter((guild) => guild.premium && guild.managed)?.length ?? 0,
    [initialGuilds],
  )
  const [guilds, setGuilds] = React.useState(sort(initialGuilds))

  const [trialWarningDialogGuild, setTrialWarningDialogGuild] = React.useState<PremiumDiscordGuild | null>(null)
  const [serverLimitDialogGuild, setServerLimitDialogGuild] = React.useState<PremiumDiscordGuild | null>(null)

  React.useEffect(() => {
    const message = subscriptionError?.message ?? guildsError?.message
    setErrorMessage(message)
  }, [subscriptionError, guildsError])

  React.useEffect(() => {
    emitter.removeAllListeners("GUILD_SYNC")
    emitter.on("GUILD_SYNC", (s) => {
      if (s.success == null && !guilds?.length) mutateGuilds(undefined, true)
    })
  })

  React.useEffect(() => {
    if (!guilds) setGuilds(sort(initialGuilds))
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

  const onClickToggle = async (guild: PremiumDiscordGuild, skipTrialWarning = false) => {
    if (!subscription) {
      setErrorMessage("No subscription")
      return
    }

    if (guild.premium && subscription.status == "trialing" && !skipTrialWarning) {
      setTrialWarningDialogGuild(guild)
      return
    }

    if (!guild.premium && premiumGuildsCount >= subscription.servers) {
      setServerLimitDialogGuild(guild)
      return
    }

    let premiumGuilds: string[]

    try {
      premiumGuilds = await fetcher(`/api/user/subscriptions/${subscription.id}/guilds/${guild.id}/premium`, {
        method: guild.premium ? "DELETE" : "PUT",
      })
    } catch (e: any) {
      const errorResponse = createErrorResponse(e)
      if (
        errorResponse.code == 404 &&
        (guild.owner || BigInt(guild.permissions) & 0x08n || BigInt(guild.permissions) & 0x20n)
      ) {
        openUrl(discord.inviteUrl(guild.id), true)
      } else if (errorResponse.code == 402 && subscription.servers != 200) {
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
      const premium = premiumGuilds.includes(guild.id)
      newGuilds[guildIndex] = { ...guild, premium, managed: premium }
    }
    setGuilds(newGuilds)

    // update initial guilds list (not filtered)
    const newInitialGuilds = initialGuilds ? [...initialGuilds] : []
    const initialGuildIndex = newInitialGuilds.findIndex((newGuild) => newGuild.id == guild.id)
    if (initialGuildIndex !== -1) {
      const guild = newInitialGuilds[initialGuildIndex]
      const premium = premiumGuilds.includes(guild.id)
      newInitialGuilds[initialGuildIndex] = { ...guild, premium, managed: premium }
    }

    mutateGuilds(newInitialGuilds, false)
  }

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

  const shouldShowServers = () => !isValidating && guilds?.length && subscription

  return (
    <UserPage title="Premium" noindex nofollow>
      <Typography variant="h4" gutterBottom>
        Your subscription
      </Typography>

      <Box mb={2}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <SubscriptionCard onClickSubscribe={onClickSubscribe} />
          </Grid>
        </Grid>
      </Box>

      <Typography variant="h4" gutterBottom>
        Servers
      </Typography>

      {shouldShowServers() && (
        <Box mb={2}>
          <TextField
            id="guild-filter"
            onChange={(value) => handleTextChange(value.target.value)}
            fullWidth
            placeholder={"Find a server..."}
          />
        </Box>
      )}

      <Grid container spacing={2}>
        {!isLoadingSubscription && !subscription && (
          <Box padding={2} width={"100%"}>
            <Alert severity="error">
              You must subscribe to premium before you can manage a server&#39;s premium status.
            </Alert>
          </Box>
        )}
        {isValidating &&
          subscription &&
          [...Array(8)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <UserGuildCard onClickToggle={onClickToggle} />
            </Grid>
          ))}
        {!isValidating && guilds && guilds.length == 0 && (
          <Box padding={2} width={"100%"}>
            <Alert severity="error">No servers found</Alert>
          </Box>
        )}
        {shouldShowServers() &&
          paginate(guilds || [], page, 12).map((guild, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <UserGuildCard guild={guild} onClickToggle={onClickToggle} />
            </Grid>
          ))}
      </Grid>

      {shouldShowServers() && (guilds?.length || 0) > 12 && (
        <Pagination
          style={{ marginTop: 15, display: "flex", alignItems: "center", justifyContent: "center" }}
          count={Math.ceil((guilds?.length || 0) / 12)}
          onChange={handleChangePage}
          variant="outlined"
        />
      )}

      <TrialWarningCard
        open={!!trialWarningDialogGuild}
        onClose={() => setTrialWarningDialogGuild(null)}
        onContinue={() => {
          if (trialWarningDialogGuild) {
            onClickToggle(trialWarningDialogGuild, true)
          }
          setTrialWarningDialogGuild(null)
        }}
        guild={trialWarningDialogGuild}
      />
      <ServerLimitCard
        open={!!serverLimitDialogGuild}
        onClose={() => setServerLimitDialogGuild(null)}
        onContinue={async () => {
          if (serverLimitDialogGuild) {
            const json: PostBillingPortalResponse = await fetcher("/api/user/billingPortal", {
              method: "POST",
            })

            document.location.assign(json.url)
          }
          setServerLimitDialogGuild(null)
        }}
        guild={serverLimitDialogGuild}
      />
    </UserPage>
  )
}

export default PremiumPage
