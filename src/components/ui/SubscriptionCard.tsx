import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Card from "@mui/material/Card"
import CardActions from "@mui/material/CardActions"
import CardContent from "@mui/material/CardContent"
import Typography from "@mui/material/Typography"

import useCurrentSubscription from "@/hooks/use-current-subscription"
import useSession from "@/hooks/use-session"
import type { ApiResponse } from "@/lib/api/response"
import type { PostBillingPortalResponse } from "@/types"
import fetcher from "@/utils/fetcher"
import { capitalize, formatDateTime } from "@/utils/formatting"

interface DetailLineProps {
  title: string
  value: string
}

const DetailLine = ({ title, value }: DetailLineProps) => (
  <Box display="flex">
    <Typography variant="body1" color="textSecondary">
      {title}:&nbsp;
    </Typography>
    <Typography variant="body1">{value}</Typography>
  </Box>
)

interface SubscriptionCardProps {
  onClickSelectPlan: () => void
}

const SubscriptionCard = ({ onClickSelectPlan }: SubscriptionCardProps) => {
  const [session, loading] = useSession()
  const { subscription } = useCurrentSubscription(session != null && !loading)

  const onClickBillingPortal = async (event: React.MouseEvent) => {
    event.preventDefault()
    const res: ApiResponse<PostBillingPortalResponse> = await fetcher("/api/user/billingPortal", {
      method: "POST",
    })

    if (res.success) {
      document.location.assign(res.data.url)
    }
  }

  let details: React.ReactNode = undefined
  if (subscription) {
    const status = subscription.status.replace("_", " ")
    const startDate = new Date(subscription.start)
    const periodEndDate = new Date(subscription.periodEnd)
    details = (
      <>
        <DetailLine title="Status" value={capitalize(status)} />
        <DetailLine title="Started" value={formatDateTime(startDate)} />
        <DetailLine
          title={subscription.cancelAtPeriodEnd ? "End of benefits" : "Next invoice"}
          value={formatDateTime(periodEndDate)}
        />
      </>
    )
  }

  const actions = subscription ? (
    <Button color="primary" onClick={onClickBillingPortal}>
      Billing portal
    </Button>
  ) : (
    <Button color="primary" onClick={onClickSelectPlan}>
      Select a plan
    </Button>
  )

  return (
    <Card>
      <CardContent>
        <Typography variant="h5">{subscription ? subscription.name : "Default"}</Typography>
        {details}
      </CardContent>
      <CardActions>{actions}</CardActions>
    </Card>
  )
}

export default SubscriptionCard
