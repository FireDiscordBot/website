import Typography from "@material-ui/core/Typography"
import * as React from "react"
import { useEffect, useState } from "react"
import { Box, Button, Card, Grid, IconButton, LinearProgress, TextField } from "@material-ui/core"
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles"
import { Delete } from "@material-ui/icons"
import useSWR from "swr"
import Tooltip from "@material-ui/core/Tooltip"
import { withStyles } from "@material-ui/styles"
import { KeyboardDateTimePicker } from "@material-ui/pickers"
import moment from "moment"
import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date"
import { StatusCodes } from "http-status-codes"

import { emitter } from "../_app"

import useSession from "@/hooks/use-session"
import UserPageLayout from "@/layouts/user-page"
import { Reminder } from "@/interfaces/aether"
import { getTimestamp } from "@/utils/discord"

const useStyles = makeStyles((theme) =>
  createStyles({
    reminderContainer: {
      marginBottom: theme.spacing(1),
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
    trashButton: {
      float: "right",
    },
  }),
)

const ReminderProgressBar = withStyles((theme: Theme) =>
  createStyles({
    root: {
      borderBottomRightRadius: "4px",
      borderBottomLeftRadius: "4px",
    },
    barColorSecondary: {
      backgroundColor: theme.palette.success.main,
    },
  }),
)(LinearProgress)

let toDelete: number[] = []

const Reminders = () => {
  const [session, loading] = useSession({ redirectTo: "/" })
  const [currentTime, setCurrentTime] = useState(0)
  const [futureDate, setFutureDate] = useState(moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"))
  const [futureText, setFutureText] = useState("")

  const classes = useStyles()

  const { data } = useSWR<Reminder[]>(session ? "/api/user/reminders" : null, {
    revalidateOnMount: true,
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
    }, 999)
    return () => {
      clearInterval(timer)
    }
  }, [currentTime])

  const handleDateChange = (_date: MaterialUiPickersDate, value?: string | null) => {
    setFutureDate(value ? value : moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"))
  }

  const handleTextChange = (value: string | null | undefined) => {
    setFutureText(value ? value : "")
  }

  const handleReminderCreate = async () => {
    const reminder = await fetch(`/api/user/reminders/create`, {
      method: "POST",
      body: JSON.stringify({ reminder: futureText, timestamp: moment(futureDate).valueOf() }),
    })
    if (!reminder.ok)
      emitter.emit("NOTIFICATION", {
        text:
          reminder.status == StatusCodes.PRECONDITION_FAILED
            ? (
                await reminder.json().catch(() => {
                  return { error: "Failed to create reminder" }
                })
              ).error
            : "Failed to create reminder",
        severity: "error",
        horizontal: "right",
        vertical: "top",
        autoHideDuration: 3000,
      })
    else if (typeof window != "undefined" && window?.document?.getElementById("reminder-text") instanceof HTMLElement) {
      const element = window.document.getElementById("reminder-text")
      if (element) element.innerText = ""
    }
  }

  const handleReminderDelete = async (reminder: Reminder) => {
    if (!toDelete.includes(reminder.timestamp)) {
      toDelete.push(reminder.timestamp)
      setTimeout(() => (toDelete = toDelete.filter((timestamp) => timestamp != reminder.timestamp)), 5000)
      return emitter.emit("NOTIFICATION", {
        text: "Click again to confirm deletion",
        severity: "warning",
        horizontal: "right",
        vertical: "top",
        autoHideDuration: 5000,
      })
    } else toDelete = toDelete.filter((timestamp) => timestamp != reminder.timestamp)
    const deleted = await fetch(`/api/user/reminders/${reminder.timestamp}`, {
      method: "DELETE",
    })
    if (!deleted.ok)
      emitter.emit("NOTIFICATION", {
        text: "Failed to delete reminder",
        severity: "error",
        horizontal: "right",
        vertical: "top",
        autoHideDuration: 3000,
      })
    else emitter.emit("NOTIFICATION", undefined)
  }

  return (
    <UserPageLayout title="Reminders" noindex nofollow>
      <Grid container direction={"column"} spacing={2}>
        <Grid item xs={12} sm={12}>
          <Typography variant="h4" gutterBottom>
            Reminders
          </Typography>
        </Grid>
        <Grid container item xs={12} sm={12} spacing={4}>
          <Grid item xs={12} md={8}>
            <TextField
              id="reminder-text"
              onChange={(value) => handleTextChange(value.target.value)}
              fullWidth
              placeholder={"Create a reminder..."}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <KeyboardDateTimePicker
              variant="inline"
              ampm={false}
              value={futureDate}
              onChange={(date, value) => handleDateChange(date, value)}
              disablePast
              format="yyyy-MM-DD HH:mm:ss"
            />
          </Grid>
          <Grid item xs={12} md={1}>
            <Button variant={"outlined"} onClick={handleReminderCreate}>
              Create
            </Button>
          </Grid>
        </Grid>
        <Grid item xs={12} sm={12}>
          {!loading && (
            <div>
              {reminders?.map((reminder, index) => (
                <div key={index} className={classes.reminderContainer}>
                  <Card className={classes.reminderCard}>
                    <Grid container direction="row">
                      <Grid item xs={12} sm={11}>
                        <Typography color="textPrimary">{reminder.text}</Typography>
                      </Grid>
                      <Grid container item xs={12} sm={1} alignContent={"flex-start"} justifyContent={"flex-end"}>
                        <IconButton
                          className={classes.trashButton}
                          onClick={() => {
                            handleReminderDelete(reminder)
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Card>
                  <Tooltip title={timeConverter(new Date(), new Date(reminder.timestamp))}>
                    <Box display="flex" alignItems="center">
                      <Box width="100%">
                        <ReminderProgressBar
                          variant="determinate"
                          color={getProgress(reminder) == 100 ? "secondary" : "primary"}
                          value={getProgress(reminder)}
                        />
                      </Box>
                    </Box>
                  </Tooltip>
                </div>
              ))}
            </div>
          )}
        </Grid>
      </Grid>
    </UserPageLayout>
  )
}

const timeConverter = (start: Date, end: Date) => {
  const difference = Math.abs(end.getTime() - start.getTime()) / 1000
  const days = Math.floor(difference / 86400)
  const hours = Math.floor(difference / 3600) % 24
  const minutes = Math.floor(difference / 60) % 60
  const seconds = Math.floor(difference) % 60
  return `${days} Days, ${hours} Hours, ${minutes} Minutes, and ${seconds} seconds left!`
}

const getProgress = (reminder: Reminder) => {
  const progress =
    ((Date.now() - getTimestamp(reminder.link)) / (reminder.timestamp - getTimestamp(reminder.link))) * 100
  return progress >= 100 ? 100 : progress
}

export default Reminders
