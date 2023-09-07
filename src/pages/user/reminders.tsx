import * as React from "react"
import { useEffect, useState } from "react"
import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Card from "@mui/material/Card"
import Grid from "@mui/material/Grid"
import IconButton from "@mui/material/IconButton"
import LinearProgress, { linearProgressClasses } from "@mui/material/LinearProgress"
import TextField from "@mui/material/TextField"
import { Delete } from "@mui/icons-material"
import useSWR from "swr"
import Tooltip from "@mui/material/Tooltip"
import { styled } from "@mui/material/styles"
import DateTimePicker from "@mui/lab/DateTimePicker"
import { StatusCodes } from "http-status-codes"
import dayjs from "dayjs"

import { emitter } from "../_app"

import useSession from "@/hooks/use-session"
import UserPageLayout from "@/layouts/user-page"
import { Reminder } from "@/interfaces/aether"
import { getTimestamp } from "@/utils/discord"

const ReminderProgressBar = styled(LinearProgress)(({ theme }) => ({
  borderBottomRightRadius: "4px",
  borderBottomLeftRadius: "4px",
  [`&.${linearProgressClasses.barColorSecondary}`]: {
    backgroundColor: theme.palette.success.main,
  },
}))

let toDelete: number[] = []

const Reminders = () => {
  const [session, loading] = useSession({ redirectTo: "login" })
  const [currentTime, setCurrentTime] = useState(0)
  const [futureDate, setFutureDate] = useState<Date | null>(null)
  const [futureText, setFutureText] = useState("")

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

  const handleDateChange = (date: Date | null) => {
    setFutureDate(date)
  }

  const handleTextChange = (value: string | null | undefined) => {
    setFutureText(value ? value : "")
  }

  const handleReminderCreate = async () => {
    const reminder = await fetch(`/api/user/reminders/create`, {
      method: "POST",
      body: JSON.stringify({ reminder: futureText, timestamp: dayjs(futureDate).valueOf() }),
    })
    if (!reminder.ok)
      emitter.emit("NOTIFICATION", {
        text:
          reminder.status == StatusCodes.PRECONDITION_FAILED || reminder.status == StatusCodes.BAD_REQUEST
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
      // @ts-ignore
      if (element) element.value = ""
      setFutureDate(null)
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
            <DateTimePicker
              ampm={false}
              value={futureDate}
              onChange={handleDateChange}
              renderInput={(props) => <TextField {...props} />}
              disablePast
            />
          </Grid>
          <Grid item xs={12} md={1}>
            <Button variant={"outlined"} onClick={handleReminderCreate}>
              Create
            </Button>
          </Grid>
        </Grid>
        <Grid item xs={12} sm={12}>
          {!loading && reminders?.length ? (
            <div>
              {reminders?.map((reminder, index) => (
                <Box key={index} mb={1}>
                  <Card
                    sx={{
                      display: "flex",
                      padding: (theme) => theme.spacing(2),
                      borderBottomRightRadius: "0",
                      borderBottomLeftRadius: "0",
                    }}
                  >
                    <Grid container direction="row">
                      <Grid item xs={12} sm={11}>
                        <Typography color="textPrimary">{reminder.text}</Typography>
                      </Grid>
                      <Grid container item xs={12} sm={1} alignContent={"flex-start"} justifyContent={"flex-end"}>
                        <IconButton
                          sx={{ float: "right" }}
                          onClick={() => {
                            handleReminderDelete(reminder)
                          }}
                          size="large"
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
                </Box>
              ))}
            </div>
          ) : <div></div>}
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
  if (!reminder.link) return 0 // temp fix, link should always exist
  const progress =
    ((Date.now() - getTimestamp(reminder.link)) / (reminder.timestamp - getTimestamp(reminder.link))) * 100
  return progress >= 100 ? 100 : progress
}

export default Reminders
