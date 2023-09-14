import * as React from "react"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Card from "@mui/material/Card"
import CardActions from "@mui/material/CardActions"
import CardContent from "@mui/material/CardContent"
import Typography from "@mui/material/Typography"

import fetcher from "@/utils/fetcher"
import { PostBillingPortalResponse } from "@/types"
import useCurrentSubscription from "@/hooks/use-current-subscription"
import useSession from "@/hooks/use-session"
import { capitalize, formatDateTime } from "@/utils/formatting"

type DetailLineProps = {
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

type Props = {
  onClickSubscribe: () => void
}

const SubscriptionCard = ({ onClickSubscribe }: Props) => {
  const [session, loading] = useSession()
  const { subscription } = useCurrentSubscription(session != null && !loading)

  const onClickBillingPortal = async (event: React.MouseEvent) => {
    event.preventDefault()
    const json: PostBillingPortalResponse = await fetcher("/api/user/billingPortal", {
      method: "POST",
    })

    document.location.assign(json.url)
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
        <DetailLine title="Servers" value={subscription.servers.toString()} />
        <DetailLine
          title={subscription.cancelAtPeriodEnd ? "End of benefits" : "Next invoice"}
          value={formatDateTime(periodEndDate)}
        />
      </>
    )
  } else
    details = (
      <>
        <Typography variant="body1" color="textSecondary" component="span">
          Get more from the bot you love with Premium!
          <br></br>
          Exclusive commands, custom redirects, improvements to features and more!
        </Typography>{" "}
      </>
    )

  const actions = subscription ? (
    <Button color="primary" onClick={onClickBillingPortal}>
      Billing portal
    </Button>
  ) : (
    <span>
      <Button color="primary" onClick={onClickSubscribe}>
        Subscribe
      </Button>
      <Button color="primary" onClick={onClickBillingPortal}>
        Billing portal
      </Button>
    </span>
  )

  return (
    <Card>
      <CardContent>
        <Typography variant="h5">{subscription ? subscription.name : "Subscribe Now"}</Typography>
        {details}
      </CardContent>
      <CardActions>{actions}</CardActions>
    </Card>
  )
}

export default SubscriptionCard
