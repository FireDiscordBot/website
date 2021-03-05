import UserPageLayout from "@/layouts/user-page";
import Typography from "@material-ui/core/Typography";
import * as React from "react";
import useSession from "@/hooks/use-session";
import {Box, Card, Grid, IconButton, LinearProgress} from "@material-ui/core";
import useSWR from "swr";
import {Reminder} from "@/interfaces/aether";
import {createStyles, makeStyles} from "@material-ui/core/styles";
import {Delete} from "@material-ui/icons";
import {getTimestamp} from "@/utils/discord";
import {useEffect, useState} from "react";

const useStyles = makeStyles((theme) =>
  createStyles({
    reminderContainer: {
      margin: theme.spacing(1)
    },
    reminderCard: {
      display: "flex",
      padding: theme.spacing(2),
      borderBottomRightRadius: "0",
      borderBottomLeftRadius: "0"
    },
    fullHeight: {
      height: "100%",
    },
    borderRight: {
      borderRight: `1px solid ${theme.palette.divider}`,
    },
    progressbar: {
      borderBottomRightRadius: "4px",
      borderBottomLeftRadius: "4px"
    },
    trashButton: {
      float: "right"
    }
  }),
)

const Reminders = () => {
  const [session, loading] = useSession({redirectTo: "/"})
  const [currentTime, setCurrentTime] = useState(0);
  const classes = useStyles();
  const {data: reminders} = useSWR<Reminder[]>(
    session ? "/api/user/reminders" : null,
    {
      revalidateOnReconnect: false,
      revalidateOnFocus: false,
    },
  )

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime((prevProgress) => (prevProgress >= Date.now() ? 0 :  Date.now() ));
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [currentTime]);
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
                <Grid
                  container
                  direction="row"
                  justify="space-between"
                  alignItems="center"
                >
                  <Grid item xs={12} sm={6}>
                    <Typography color="textPrimary">
                      {reminder.text}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} >
                    <IconButton className={classes.trashButton} > <Delete/></IconButton>
                  </Grid>
                </Grid>
              </Card>
              <Box display="flex" alignItems="center">
                <Box width="100%">
                  <LinearProgress variant="determinate" value={(Date.now()-getTimestamp(reminder.link)) / (reminder.timestamp-getTimestamp(reminder.link)) * 100} className={classes.progressbar}/>
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
