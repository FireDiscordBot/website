import * as React from "react"
import { GetStaticProps } from "next"
import useSWR from "swr"
import Grid from "@material-ui/core/Grid"
import Paper from "@material-ui/core/Paper"
import Box from "@material-ui/core/Box"
import Typography from "@material-ui/core/Typography"
import UserPage from "@/layouts/user-page"
import PlanCard from "@/components/PlanCard"
import Loading from "@/components/loading"
import { Plan } from "@/interfaces/fire"
import { fetchPlans } from "@/lib/plans"
import { UserGuild } from "@/interfaces/aether"
import useSession from "@/hooks/use-session"

type Props = { plans: Plan[] }

const AccountPage = ({ plans }: Props) => {
  const [session, loading] = useSession({ redirectTo: "/" })
  const { data: guilds, isValidating } = useSWR<UserGuild[]>(session ? "/api/user/guilds" : null)
  const orderedPlans = React.useMemo(() => {
    return plans.sort((a, b) => a.servers - b.servers)
  }, [plans])

  if (!session || loading) {
    return <Loading />
  }

  return (
    <UserPage>
      <Typography variant="h4" gutterBottom>
        Guilds
      </Typography>

      <Grid container spacing={2}>
        {isValidating && <>loading</>}
        {guilds?.map((guild, index) => (
          <Grid item xs={2} key={index}>
            <Paper style={{ height: "100%" }}>
              <Box p={2}>
                <div>{guild.name}</div>
                <div>premium? {JSON.stringify(guild.premium)}</div>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h4" gutterBottom>
        Plans
      </Typography>

      <Grid container spacing={2}>
        {orderedPlans.map((plan, index) => (
          <Grid item xs={4} key={index}>
            <PlanCard plan={plan} />
          </Grid>
        ))}
      </Grid>
    </UserPage>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const plans = await fetchPlans()

  return {
    props: {
      plans,
    },
    revalidate: 3600,
  }
}

export default AccountPage
