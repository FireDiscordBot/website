import * as React from "react"
import CardContent from "@material-ui/core/CardContent"
import CustomCircularProgress from "./CustomCircularProgress"
import Card from "@material-ui/core/Card"
import { createStyles, makeStyles } from "@material-ui/core/styles"
import { Props } from './CustomCircularProgress'

const useStyles = makeStyles(theme =>
  createStyles({
    cardContent: {
      "&:last-child": {
        paddingBottom: theme.spacing(2),
      },
    },
    fullHeight: {
      height: '100%',
    },
  }),
)

const CircularProgressCard = (props: Props) => {
  const classes = useStyles()
  return (
    <Card className={classes.fullHeight}>
      <CardContent classes={{ root: classes.cardContent }}>
        <CustomCircularProgress {...props}/>
      </CardContent>
    </Card>
  )
}

export default CircularProgressCard
