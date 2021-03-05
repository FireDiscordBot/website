import Typography from "@material-ui/core/Typography"
import * as React from "react"
import { Box, Card, Grid, IconButton, LinearProgress } from "@material-ui/core"
import { createStyles, makeStyles } from "@material-ui/core/styles"
import { Delete } from "@material-ui/icons"
import { useEffect, useState } from "react"
import useSWR, { cache } from "swr"

import { emitter } from "../_app"

import useSession from "@/hooks/use-session"
import UserPageLayout from "@/layouts/user-page"
import { Reminder } from "@/interfaces/aether"
import { getTimestamp } from "@/utils/discord"

const useStyles = makeStyles((theme) =>
  createStyles({
    reminderContainer: {
      margin: theme.spacing(1),
    },
    reminderCard: {
      display: "flex",
      padding: theme.spacing(2),
      borderBottomRightRadius: "0",
      borderBottomLeftRadius: "0",
    },
    fullHeight: {
      height: "100%",
    },
    borderRight: {
      borderRight: `1px solid ${theme.palette.divider}`,
    },
    progressbar: {
      borderBottomRightRadius: "4px",
      borderBottomLeftRadius: "4px",
    },
    trashButton: {
      float: "right",
    },
  }),
)

const Reminders = () => {
  const [session, loading] = useSession({ redirectTo: "/" })
  const [currentTime, setCurrentTime] = useState(0)
  const classes = useStyles()

  const { data } = useSWR<Reminder[]>(session ? "/api/user/reminders" : null, {
    revalidateOnMount: !cache.has(session ? "/api/user/reminders" : null),
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })
  const [reminders, setReminders] = React.useState<Reminder[] | undefined>(data)

  React.useEffect(() => {
    emitter.removeAllListeners("REMINDERS_UPDATE")
    emitter.on("REMINDERS_UPDATE", setReminders)
  }, [reminders])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime((prevProgress) => (prevProgress >= Date.now() ? 0 : Date.now()))
    }, 1000)
    return () => {
      clearInterval(timer)
    }
  }, [currentTime])
  return (
    <UserPageLayout title="Reminders" noindex nofollow>
      <Typography variant="h4" gutterBottom>
        Reminders
      </Typography>
      {!loading && (
        <div>
          {reminders?.map((reminder, index) => (
            <div key={index} className={classes.reminderContainer}>
              <Card className={classes.reminderCard}>
                <Grid container direction="row" justify="space-between" alignItems="center">
                  <Grid item xs={12} sm={6}>
                    <Typography color="textPrimary">{reminder.text}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <IconButton className={classes.trashButton}>
                      {" "}
                      <Delete />
                    </IconButton>
                  </Grid>
                </Grid>
              </Card>
              <Box display="flex" alignItems="center">
                <Box width="100%">
                  <LinearProgress
                    variant="determinate"
                    value={
                      ((Date.now() - getTimestamp(reminder.link)) /
                        (reminder.timestamp - getTimestamp(reminder.link))) *
                      100
                    }
                    className={classes.progressbar}
                  />
                  {}
                </Box>
              </Box>
            </div>
          ))}
        </div>
      )}
    </UserPageLayout>
  )
}

export default Reminders
